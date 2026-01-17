"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    EmployeeService,
    type EmployeeWithUser,
} from "@/lib/services/employee";
import { UserStatus } from "@/lib/types/auth";

interface EmployeeComboboxProps {
    value?: string;
    onChange: (value: string) => void;
    disabled?: boolean;
    excludeEmployeeId?: string;
    placeholder?: string;
}

export function EmployeeCombobox({
    value,
    onChange,
    disabled = false,
    excludeEmployeeId,
    placeholder = "Select manager...",
}: EmployeeComboboxProps) {
    const [open, setOpen] = React.useState(false);
    const [loading, setLoading] = React.useState(false);
    const [employees, setEmployees] = React.useState<EmployeeWithUser[]>([]);
    const [searchQuery, setSearchQuery] = React.useState("");

    // Load all active employees with pagination
    React.useEffect(() => {
        async function loadAllEmployees() {
            setLoading(true);
            try {
                const allEmployees: EmployeeWithUser[] = [];
                let page = 1;
                const limit = 100;
                let hasMore = true;

                while (hasMore) {
                    const response = await EmployeeService.getEmployees({
                        page,
                        limit,
                        status: UserStatus.ACTIVE,
                    });

                    allEmployees.push(...response.data);

                    // Check if there are more pages
                    hasMore =
                        response.pagination &&
                        page < response.pagination.totalPages;
                    page++;
                }

                // Filter out the excluded employee and only keep active employees
                const filteredEmployees = allEmployees.filter(
                    (emp) =>
                        emp._id !== excludeEmployeeId &&
                        emp.userId?.status === UserStatus.ACTIVE
                );

                setEmployees(filteredEmployees);
            } catch (error) {
                console.error("Failed to load employees:", error);
                setEmployees([]);
            } finally {
                setLoading(false);
            }
        }

        loadAllEmployees();
    }, [excludeEmployeeId]);

    // Format employee name for display
    const getEmployeeName = (employee: EmployeeWithUser) => {
        const fullName =
            `${employee.userId?.firstName ?? ""} ${
                employee.userId?.lastName ?? ""
            }`.trim();
        return fullName || employee.userId?.email || "Unknown";
    };

    // Get the display value for the selected employee
    const selectedEmployee = employees.find((emp) => emp._id === value);
    const selectedLabel = selectedEmployee
        ? getEmployeeName(selectedEmployee)
        : placeholder;

    // Filter employees based on search query
    const filteredEmployees = React.useMemo(() => {
        if (!searchQuery) return employees;

        const query = searchQuery.toLowerCase();
        return employees.filter((emp) => {
            const name = getEmployeeName(emp).toLowerCase();
            const email = emp.userId?.email?.toLowerCase() || "";
            const employeeId = emp.employeeId?.toLowerCase() || "";
            const department = emp.department?.toLowerCase() || "";
            const jobTitle = emp.jobTitle?.toLowerCase() || "";

            return (
                name.includes(query) ||
                email.includes(query) ||
                employeeId.includes(query) ||
                department.includes(query) ||
                jobTitle.includes(query)
            );
        });
    }, [employees, searchQuery]);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between"
                    disabled={disabled || loading}
                >
                    <span className="truncate">{selectedLabel}</span>
                    {loading ? (
                        <Loader2 className="ml-2 h-4 w-4 shrink-0 animate-spin opacity-50" />
                    ) : (
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[400px] p-0" align="start">
                <Command shouldFilter={false}>
                    <CommandInput
                        placeholder="Search by name, email, ID, department..."
                        value={searchQuery}
                        onValueChange={setSearchQuery}
                    />
                    <CommandList>
                        <CommandEmpty>
                            {loading
                                ? "Loading employees..."
                                : "No employees found."}
                        </CommandEmpty>
                        <CommandGroup>
                            <CommandItem
                                value="none"
                                onSelect={() => {
                                    onChange("");
                                    setOpen(false);
                                }}
                            >
                                <Check
                                    className={cn(
                                        "mr-2 h-4 w-4",
                                        !value ? "opacity-100" : "opacity-0"
                                    )}
                                />
                                No Manager
                            </CommandItem>
                            {filteredEmployees.map((employee) => (
                                <CommandItem
                                    key={employee._id}
                                    value={employee._id}
                                    onSelect={(currentValue) => {
                                        onChange(currentValue);
                                        setOpen(false);
                                    }}
                                    className="gap-2"
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4 shrink-0",
                                            value === employee._id
                                                ? "opacity-100"
                                                : "opacity-0"
                                        )}
                                    />
                                    <div className="flex flex-col overflow-hidden">
                                        <span className="truncate font-medium">
                                            {getEmployeeName(employee)}
                                        </span>
                                        <span className="truncate text-xs text-muted-foreground">
                                            {employee.jobTitle && employee.department
                                                ? `${employee.jobTitle} • ${employee.department}`
                                                : employee.jobTitle || employee.department || employee.userId?.email}
                                        </span>
                                    </div>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
