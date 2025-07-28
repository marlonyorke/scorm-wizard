import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";

import { Button } from "@/components/ui/button";

describe("Button Component", () => {
  it("renders correctly with default props", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole("button", { name: /click me/i })).toBeInTheDocument();
  });

  it("calls onClick handler when clicked", async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    const button = screen.getByRole("button", { name: /click me/i });
    await userEvent.click(button);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("can be disabled", () => {
    render(<Button disabled>Click me</Button>);
    expect(screen.getByRole("button", { name: /click me/i })).toBeDisabled();
  });

  it("renders with different variants", () => {
    const { rerender } = render(<Button variant="outline">Outline Button</Button>);
    const outlineButton = screen.getByRole("button", { name: /outline button/i });
    expect(outlineButton.className).toContain("border-input");
    
    rerender(<Button variant="destructive">Destructive Button</Button>);
    const destructiveButton = screen.getByRole("button", { name: /destructive button/i });
    expect(destructiveButton.className).toContain("bg-destructive");
  });
});
