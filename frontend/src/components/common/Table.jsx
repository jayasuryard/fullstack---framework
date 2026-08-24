import React from 'react';

export default function Table({ columns, data, onRowClick }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-white/10">
      <table className="w-full text-left border-collapse">
        <thead className="bg-white/5 border-b border-white/10">
          <tr>
            {columns.map((column, index) => (
              <th
                key={index}
                className="px-6 py-4 text-xs font-bold text-white/40 uppercase tracking-wider whitespace-nowrap"
                style={{ width: column.width }}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/10 bg-white/[0.02]">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-6 py-12 text-center text-white/40">
                <div className="flex flex-col items-center justify-center">
                  <span className="text-3xl mb-2 text-white/20">📄</span>
                  <p>No data available</p>
                </div>
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className={`hover:bg-white/5 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
                onClick={() => onRowClick && onRowClick(row)}
              >
                {columns.map((column, colIndex) => {
                  // Support for string accessors OR function accessors OR custom renders
                  let cellContent;
                  if (column.render) {
                    cellContent = column.render(row);
                  } else if (typeof column.accessor === 'function') {
                    cellContent = column.accessor(row);
                  } else {
                    cellContent = row[column.accessor || column.key];
                  }

                  return (
                    <td key={colIndex} className="px-6 py-4 text-sm text-white/80">
                      {cellContent}
                    </td>
                  );
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}