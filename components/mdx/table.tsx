import React from "react";

interface TableProps {
  children: React.ReactNode;
}

interface TableCellProps {
  children: React.ReactNode;
}

export function ResponsiveTable({ children }: TableProps) {
  return (
    <div className="my-6 w-full overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        {children}
      </table>
    </div>
  );
}

export function TableHead({ children }: TableProps) {
  return (
    <thead className="bg-gray-50 dark:bg-gray-800">
      {children}
    </thead>
  );
}

export function TableBody({ children }: TableProps) {
  return (
    <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
      {children}
    </tbody>
  );
}

export function TableRow({ children }: TableProps) {
  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
      {children}
    </tr>
  );
}

export function TableHeader({ children }: TableCellProps) {
  return (
    <th className="px-3 py-2.5 text-left text-sm font-semibold text-gray-900 dark:text-white sm:px-4 sm:py-3 sm:whitespace-nowrap">
      {children}
    </th>
  );
}

export function TableCell({ children }: TableCellProps) {
  return (
    <td className="px-3 py-2.5 text-sm text-gray-700 dark:text-gray-300 sm:px-4 sm:py-3 sm:whitespace-nowrap">
      {children}
    </td>
  );
}
