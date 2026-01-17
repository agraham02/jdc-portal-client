/**
 * Department enum matching backend schema
 */
export enum Department {
    ENGINEERING = "Engineering",
    HR = "HR",
    SALES = "Sales",
    MARKETING = "Marketing",
    FINANCE = "Finance",
    OPERATIONS = "Operations",
    LEGAL = "Legal",
    IT = "IT",
    CUSTOMER_SERVICE = "Customer Service",
    ADMINISTRATION = "Administration",
}

/**
 * Get all department values as an array
 */
export const DEPARTMENTS = Object.values(Department);

/**
 * Department options for dropdowns
 */
export const DEPARTMENT_OPTIONS = DEPARTMENTS.map((dept) => ({
    value: dept,
    label: dept,
}));
