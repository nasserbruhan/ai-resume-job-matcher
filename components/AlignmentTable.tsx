
import React from 'react';
import { SkillAlignmentRow } from '../types';

interface AlignmentTableProps {
  data: SkillAlignmentRow[];
}

const AlignmentTable: React.FC<AlignmentTableProps> = ({ data }) => {
  return (
    <div className="overflow-x-auto glass-card rounded-xl border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Job Requires</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Found in Resume</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Match</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((row, idx) => (
            <tr key={idx} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{row.category}</td>
              <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">{row.jobRequires}</td>
              <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">{row.foundInResume}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  row.match.toLowerCase().includes('high') ? 'bg-green-100 text-green-800' :
                  row.match.toLowerCase().includes('partial') ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {row.match}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AlignmentTable;
