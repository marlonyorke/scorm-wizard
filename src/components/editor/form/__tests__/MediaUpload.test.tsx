import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { MediaUpload } from "../MediaUpload";

import { useToast } from "@/components/ui/use-toast";

// Mock the useToast hook
vi.mock("@/components/ui/use-toast", () => ({
  useToast: vi.fn().mockReturnValue({
    toast: vi.fn(),
  }),
}));

// Mock FileReader
class MockFileReader {
  onload: (() => void) | null = null;
  onerror: ((error: Error) => void) | null = null;
  result: string | ArrayBuffer | null = null;

  readAsDataURL(file: Blob) {
    setTimeout(() => {
      this.result = "data:image/jpeg;base64,mockBase64String";
      if (this.onload) {
        this.onload();
      }
    }, 0);
  }
}

// Replace global FileReader with mock
global.FileReader = MockFileReader as any;

describe("MediaUpload", () => {
  const mockOnMediaChange = vi.fn();
  const mockToast = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useToast as any).mockReturnValue({ toast: mockToast });
  });

  it("renders upload button when no media is provided", () => {
    render(<MediaUpload onMediaChange={mockOnMediaChange} />);
    
    expect(screen.getByText("Afbeelding toevoegen")).toBeInTheDocument();
    expect(screen.getByText("PNG, JPG of GIF (max. 5MB)")).toBeInTheDocument();
  });

  it("renders size selector when media is provided", () => {
    render(
      <MediaUpload 
        media="data:image/jpeg;base64,testBase64" 
        onMediaChange={mockOnMediaChange} 
      />,
    );
    
    expect(screen.getByText("Afbeeldingsgrootte")).toBeInTheDocument();
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  it("calls onMediaChange when file is uploaded", async () => {
    render(<MediaUpload onMediaChange={mockOnMediaChange} />);
    
    const file = new File(["dummy content"], "test.jpg", { type: "image/jpeg" });
    const input = screen.getByLabelText("Afbeelding toevoegen");
    
    fireEvent.change(input, { target: { files: [file] } });
    
    await waitFor(() => {
      expect(mockOnMediaChange).toHaveBeenCalledWith(
        "data:image/jpeg;base64,mockBase64String",
        { width: 300, height: 200 }, // Default medium size
      );
    });
    
    expect(mockToast).toHaveBeenCalledWith({
      title: "Media geüpload",
      description: "De afbeelding is succesvol toegevoegd.",
    });
  });

  it("shows error toast when file is too large", () => {
    render(<MediaUpload onMediaChange={mockOnMediaChange} />);
    
    // Create a file that's larger than 5MB
    const largeFile = new File([""], "large.jpg", { type: "image/jpeg" });
    Object.defineProperty(largeFile, "size", { value: 6 * 1024 * 1024 });
    
    const input = screen.getByLabelText("Afbeelding toevoegen");
    fireEvent.change(input, { target: { files: [largeFile] } });
    
    expect(mockToast).toHaveBeenCalledWith({
      variant: "destructive",
      title: "Fout bij uploaden",
      description: "Het bestand is te groot. Maximum grootte is 5MB.",
    });
    expect(mockOnMediaChange).not.toHaveBeenCalled();
  });

  it("changes image size when size selector is changed", async () => {
    render(
      <MediaUpload 
        media="data:image/jpeg;base64,testBase64" 
        onMediaChange={mockOnMediaChange} 
        imageSize={{ width: 300, height: 200 }}
      />,
    );
    
    // Open the dropdown
    const sizeSelector = screen.getByRole("combobox");
    fireEvent.click(sizeSelector);
    
    // Select "Groot"
    const largeOption = screen.getByText("Groot");
    fireEvent.click(largeOption);
    
    expect(mockOnMediaChange).toHaveBeenCalledWith(
      "data:image/jpeg;base64,testBase64",
      { width: 450, height: 300 },
    );
  });

  it("initializes with the closest predefined size", () => {
    render(
      <MediaUpload 
        media="data:image/jpeg;base64,testBase64" 
        onMediaChange={mockOnMediaChange} 
        imageSize={{ width: 210, height: 140 }}
      />,
    );
    
    // Should initialize with "small" since 210 is closer to 200 than to 300
    const sizeSelector = screen.getByRole("combobox");
    expect(sizeSelector).toHaveTextContent("Klein");
  });
});
