import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Program } from './programList';

const ProgramCard = ({ program, onSelect }: { program: Program, onSelect: (program: Program) => void }) => {
  return (
    <div
      className={`mb-4 p-1 rounded-lg shadow-md transition-all duration-200 ease-in-out cursor-pointer hover:shadow-xl hover:transform hover:-translate-y-1 
                 ${program.isOngoing ? 'border-2 border-yellow-400 bg-yellow-50' : 'bg-white'}`}
      onClick={() => onSelect(program)}
    >
      <div className="p-3">
        <div className="flex items-center mb-2">
          <div className="w-8 h-8 flex items-center justify-center mr-3">
            <FontAwesomeIcon
              icon={program.icon}
              className="w-5 h-5 text-green-700"
            />
          </div>
          <h3 className="text-sm font-bold text-gray-800 flex-1">{program.title}</h3>
        </div>
        <div className="text-xs text-gray-500 pl-11">
          <p className="mb-1">
            <span className="font-semibold">場所:</span> {program.place}
          </p>
          <p>
            <span className="font-semibold">運営:</span> {program.owner}
          </p>
          {/* ★★★ 残り時間の表示を追加 ★★★ */}
          {program.isOngoing && program.remainingTime && (
            <p className="mt-2 text-sm font-bold text-red-500">
              {program.remainingTime}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProgramCard;