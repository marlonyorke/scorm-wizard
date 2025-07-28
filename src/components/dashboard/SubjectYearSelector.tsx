import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { EducationLevel } from "@/types/education";

interface SubjectYearSelectorProps {
  selectedLevel: EducationLevel | null;
  selectedYear: string;
  selectedSubject: string;
  onYearChange: (year: string) => void;
  onSubjectChange: (subject: string) => void;
}

export function SubjectYearSelector({
  selectedLevel,
  selectedYear,
  selectedSubject,
  onYearChange,
  onSubjectChange,
}: SubjectYearSelectorProps) {
  const getAvailableYears = (level: EducationLevel | null) => {
    if (!level) {
      return [];
    }
    const yearCount = level === "MAVO" ? 4 : level === "HAVO" ? 5 : 6;
    return Array.from({ length: yearCount }, (_, i) => i + 1);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-2">Selecteer leerjaar</h2>
        <Select
          value={selectedYear}
          onValueChange={onYearChange}
          disabled={!selectedLevel}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Kies een leerjaar" />
          </SelectTrigger>
          <SelectContent>
            {getAvailableYears(selectedLevel).map((year) => (
              <SelectItem key={year} value={year.toString()}>
                Leerjaar {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-2">Selecteer vak</h2>
        <Select
          value={selectedSubject}
          onValueChange={onSubjectChange}
          disabled={!selectedYear}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Kies een vak" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="nederlands">Nederlands</SelectItem>
            <SelectItem value="engels">Engels</SelectItem>
            <SelectItem value="wiskunde">Wiskunde</SelectItem>
            <SelectItem value="biologie">Biologie</SelectItem>
            <SelectItem value="aardrijkskunde">Aardrijkskunde</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}