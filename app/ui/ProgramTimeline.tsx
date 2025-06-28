import React from 'react';
import ProgramCard from './ProgramCard';
import { Program } from './programList';

interface GroupedPrograms {
  [time: string]: Program[];
}

const ProgramTimeline = ({ programs, onSelectProgram, selectedDate }: { programs: Program[], onSelectProgram: (program: Program) => void, selectedDate: Date }) => {
  const selectedDateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;

  const groupedPrograms = programs.reduce((acc, program) => {
    const schedule = program.schedule?.find(s => s.day === selectedDateStr);
    
    // ★★★ 修正点: 終日イベントの判定を修正 ★★★
    // openフィールドが存在し、かつ「:」が含まれている場合のみ時間をキーとし、それ以外は「終日」とする
    const time = schedule?.open && schedule.open.includes(':') 
      ? schedule.open 
      : '終日';
    
    if (!acc[time]) {
      acc[time] = [];
    }
    acc[time].push(program);
    return acc;
  }, {} as GroupedPrograms);
  
  const sortedTimes = Object.keys(groupedPrograms).sort((a,b) => {
    if (a === '終日') return -1; // 「終日」を常に一番上に表示
    if (b === '終日') return 1;
    return a.localeCompare(b); // それ以外の時間は文字列としてソート
  });

  return (
    <div className="container mx-auto px-4">
      {sortedTimes.map((time, index) => (
        <div key={time} className="flex relative pb-8">
          {index < sortedTimes.length -1 && <div className="absolute left-6 top-5 h-full w-0.5 bg-gray-300"></div>}

          <div className="flex-shrink-0 w-12 text-right pr-4">
            <div className="bg-gray-300 w-6 h-6 rounded-full inline-flex items-center justify-center">
            </div>
            <p className="text-xs text-gray-500 mt-1">{time}</p>
          </div>
          <div className="flex-grow pl-4">
            {groupedPrograms[time].map(program => (
              <ProgramCard key={program.id} program={program} onSelect={onSelectProgram} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProgramTimeline;