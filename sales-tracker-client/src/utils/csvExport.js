// Utility functions for exporting data to CSV

/**
 * Converts an array of objects to CSV format
 * @param {Array} data - Array of objects to convert
 * @param {Array} headers - Array of header objects with {key, label}
 * @returns {string} CSV formatted string
 */
export const convertToCSV = (data, headers) => {
  if (!data || data.length === 0) {
    return '';
  }

  // Create header row
  const headerRow = headers.map(h => h.label).join(',');
  
  // Create data rows
  const dataRows = data.map(row => {
    return headers.map(header => {
      let value = row[header.key];
      
      // Handle null/undefined
      if (value === null || value === undefined) {
        return '';
      }
      
      // Handle arrays (like aligned_sector)
      if (Array.isArray(value)) {
        value = value.join('; ');
      }
      
      // Handle objects
      if (typeof value === 'object') {
        value = JSON.stringify(value);
      }
      
      // Convert to string and escape quotes
      value = String(value).replace(/"/g, '""');
      
      // Wrap in quotes if contains comma, newline, or quote
      if (value.includes(',') || value.includes('\n') || value.includes('"')) {
        return `"${value}"`;
      }
      
      return value;
    }).join(',');
  }).join('\n');
  
  return `${headerRow}\n${dataRows}`;
};

/**
 * Triggers a download of CSV data
 * @param {string} csvContent - CSV formatted string
 * @param {string} filename - Name of the file to download
 */
export const downloadCSV = (csvContent, filename) => {
  // Create blob with UTF-8 BOM for Excel compatibility
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  
  // Create download link
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up
  URL.revokeObjectURL(url);
};

/**
 * Export leads data to CSV
 * @param {Array} leads - Array of lead objects
 * @param {string} filename - Optional filename
 */
export const exportLeadsToCSV = (leads, filename = `leads_export_${new Date().toISOString().split('T')[0]}.csv`) => {
  const headers = [
    { key: 'contact_name', label: 'Contact Name' },
    { key: 'company_name', label: 'Company' },
    { key: 'contact_title', label: 'Role/Title' },
    { key: 'contact_email', label: 'Email' },
    { key: 'contact_phone', label: 'Phone' },
    { key: 'linkedin_url', label: 'LinkedIn URL' },
    { key: 'lead_temperature', label: 'Temperature' },
    { key: 'stage', label: 'Stage' },
    { key: 'source', label: 'Source' },
    { key: 'ownership', label: 'Owner' },
    { key: 'aligned_sector', label: 'Aligned Sectors' },
    { key: 'job_title', label: 'Job Title' },
    { key: 'job_posting_url', label: 'Job Posting URL' },
    { key: 'experience_level', label: 'Experience Level' },
    { key: 'outreach_date', label: 'Outreach Date' },
    { key: 'notes', label: 'Notes' },
    { key: 'status', label: 'Status' },
    { key: 'created_at', label: 'Created At' },
    { key: 'updated_at', label: 'Updated At' }
  ];
  
  const csvContent = convertToCSV(leads, headers);
  downloadCSV(csvContent, filename);
};

/**
 * Export builders data to CSV
 * @param {Array} builders - Array of builder objects
 * @param {string} filename - Optional filename
 */
export const exportBuildersToCSV = (builders, filename = `builders_export_${new Date().toISOString().split('T')[0]}.csv`) => {
  const headers = [
    { key: 'name', label: 'Full Name' },
    { key: 'email', label: 'Email' },
    { key: 'cohort', label: 'Cohort' },
    { key: 'status', label: 'Status' },
    { key: 'role', label: 'Desired Role' },
    { key: 'years_of_experience', label: 'Years of Experience' },
    { key: 'education', label: 'Education Level' },
    { key: 'university', label: 'University' },
    { key: 'major', label: 'Major' },
    { key: 'education_completed', label: 'Education Completed' },
    { key: 'date_of_birth', label: 'Date of Birth' },
    { key: 'aligned_sector', label: 'Aligned Sectors' },
    { key: 'sector_alignment_notes', label: 'Sector Alignment Notes' },
    { key: 'skills', label: 'Skills' },
    { key: 'linkedin_url', label: 'LinkedIn' },
    { key: 'github_url', label: 'GitHub' },
    { key: 'portfolio_url', label: 'Portfolio' },
    { key: 'bio', label: 'Bio' },
    { key: 'potential_matches', label: 'Potential Matches' },
    { key: 'created_at', label: 'Created At' },
    { key: 'updated_at', label: 'Updated At' }
  ];
  
  const csvContent = convertToCSV(builders, headers);
  downloadCSV(csvContent, filename);
};

/**
 * Export job postings data to CSV
 * @param {Array} jobPostings - Array of job posting objects
 * @param {string} filename - Optional filename
 */
export const exportJobPostingsToCSV = (jobPostings, filename = `job_postings_${new Date().toISOString().split('T')[0]}.csv`) => {
  const headers = [
    { key: 'job_title', label: 'Job Title' },
    { key: 'company_name', label: 'Company' },
    { key: 'job_url', label: 'Job URL' },
    { key: 'experience_level', label: 'Experience Level' },
    { key: 'source', label: 'Source' },
    { key: 'lead_temperature', label: 'Priority' },
    { key: 'aligned_sector', label: 'Aligned Sectors' },
    { key: 'ownership', label: 'Owner' },
    { key: 'notes', label: 'Notes' },
    { key: 'created_at', label: 'Date Posted' },
    { key: 'updated_at', label: 'Last Updated' }
  ];
  
  // Process job postings to format aligned_sector properly
  const processedData = jobPostings.map(job => ({
    ...job,
    aligned_sector: typeof job.aligned_sector === 'string' 
      ? JSON.parse(job.aligned_sector || '[]')
      : job.aligned_sector || [],
    created_at: job.created_at ? new Date(job.created_at).toLocaleDateString() : '',
    updated_at: job.updated_at ? new Date(job.updated_at).toLocaleDateString() : ''
  }));
  
  const csvContent = convertToCSV(processedData, headers);
  downloadCSV(csvContent, filename);
};

