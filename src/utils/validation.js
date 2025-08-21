import { parseISO, isValid, isAfter, isBefore } from 'date-fns';

export function validateInputs(argv) {
  const { company, start, end, source } = argv;

  if (!company || company.trim().length < 2) {
    throw new Error('Company name must be at least 2 characters.');
  }

  const startDate = parseISO(start);
  const endDate = parseISO(end);

  if (!isValid(startDate)) {
    throw new Error(`Invalid start date: ${start}`);
  }
  if (!isValid(endDate)) {
    throw new Error(`Invalid end date: ${end}`);
  }

  if (isAfter(startDate, endDate)) {
    throw new Error('Start date must be before end date.');
  }

  const supportedSources = ['g2', 'capterra', 'trustradius'];
  if (!supportedSources.includes(source)) {
    throw new Error(`Unsupported source: ${source}`);
  }

  return {
    company: company.trim(),
    start: startDate,
    end: endDate,
    source,
  };
}
