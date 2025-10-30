export interface Employee {
  id: string;
  name: string;
  plan: number;
  fact: number;
  percentage: number;
  grade: number;
}

export interface AdditionalMetric {
  id: string;
  name: string;
  plan: number;
  fact: number;
  percentage: number;
}

export const calculatePercentage = (fact: number, plan: number): number => {
  if (plan === 0) return 0;
  return (fact / plan) * 100;
};

export const calculateGrade = (percentage: number): number => {
  if (percentage <= 10) return 0;
  if (percentage <= 35) return 1;
  if (percentage <= 50) return 2;
  if (percentage <= 65) return 3;
  if (percentage <= 79) return 4;
  return 5;
};

export const getGradeColor = (grade: number): string => {
  const colors = [
    'bg-red-500',
    'bg-orange-500',
    'bg-yellow-500',
    'bg-blue-500',
    'bg-indigo-500',
    'bg-green-500',
  ];
  return colors[grade] || 'bg-gray-500';
};
