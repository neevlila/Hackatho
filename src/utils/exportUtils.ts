import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { Timetable } from '../types';

export const exportTimetableToPDF = (timetable: Timetable) => {
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(18);
  doc.text(`Timetable: ${timetable.name}`, 20, 20);
  
  doc.setFontSize(12);
  doc.text(`Semester: ${timetable.semester}`, 20, 35);
  doc.text(`Generated on: ${timetable.createdAt.toLocaleDateString()}`, 20, 45);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const timeSlots = [
    '09:00 - 10:00', '10:00 - 11:00', '11:00 - 12:00', 
    '12:00 - 13:00', '13:00 - 14:00', '14:00 - 15:00', 
    '15:00 - 16:00', '16:00 - 17:00'
  ];

  const tableData = timeSlots.map(time => {
    const row = [time];
    days.forEach(day => {
      const slot = timetable.timeSlots.find(s => 
        s.day === day && `${s.startTime} - ${s.endTime}` === time
      );
      
      if (slot) {
        row.push(`${slot.subject.name}\n${slot.faculty.name}\n${slot.classroom.name}`);
      } else {
        row.push('Free');
      }
    });
    return row;
  });

  autoTable(doc, {
    head: [['Time', ...days]],
    body: tableData,
    startY: 60,
    styles: {
      fontSize: 8,
      cellPadding: 2
    },
    columnStyles: {
      0: { fontStyle: 'bold' }
    }
  });

  doc.save(`${timetable.name.replace(/\s+/g, '_')}_timetable.pdf`);
};

export const exportTimetableToExcel = (timetable: Timetable) => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const timeSlots = [
    '09:00 - 10:00', '10:00 - 11:00', '11:00 - 12:00', 
    '12:00 - 13:00', '13:00 - 14:00', '15:00 - 16:00', 
    '16:00 - 17:00', '17:00 - 18:00'
  ];

  const worksheetData = [
    ['Time', ...days],
    ...timeSlots.map(time => {
      const row = [time];
      days.forEach(day => {
        const slot = timetable.timeSlots.find(s => 
          s.day === day && `${s.startTime} - ${s.endTime}` === time
        );
        
        if (slot) {
          row.push(`${slot.subject.name} | ${slot.faculty.name} | ${slot.classroom.name}`);
        } else {
          row.push('Free');
        }
      });
      return row;
    })
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Timetable');

  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
  saveAs(blob, `${timetable.name.replace(/\s+/g, '_')}_timetable.xlsx`);
};

export const exportDataToExcel = (data: any[], filename: string, sheetName: string) => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
  saveAs(blob, `${filename}.xlsx`);
};
