# Sector Matching Between Leads and Builders

## Overview
This update creates intelligent matching between Builders and Leads based on Aligned Sectors, making it easy to identify which companies are the best fit for each builder.

## New Features

### 1. Aligned Sectors Display in All Leads Cards

**What Changed:**
- Lead cards now display "Aligned Sectors" next to "Last Contact"
- Shows all sectors assigned to that lead (e.g., "Healthcare, Education")
- Sectors are displayed in blue for easy visibility

**Example Display:**
```
Status: Sales Pitch Meeting
Last Contact: Today
Sectors: Healthcare, Education
```

### 2. Top 5 Recent Company Matches on Builder Cards

**What Changed:**
- Builder cards now automatically show the **top 5 most recent** companies from All Leads that share aligned sectors
- Companies are sorted by most recent activity (updated_at, created_at, or outreach_date)
- Maximum of 5 companies displayed to keep cards clean

**Example Display:**
```
🎯 Aligned Sectors: Healthcare, Education

Top 5 Recent Matches:
• Toy Story Inc.
• Memorial Sloan Kettering
• NYC Department of Education
• Kaiser Permanente
• Columbia University
```

**When No Matches:**
If no companies match the builder's sectors, the card shows:
```
No matching companies yet. Check All Leads for companies in Healthcare, Education
```

## How It Works

### Matching Logic:
1. **Builder's Aligned Sectors** are compared against **Lead's Aligned Sectors**
2. Any overlap triggers a match (e.g., if builder has "Healthcare" and lead has "Healthcare, Fintech", it's a match)
3. All matching companies are collected
4. Companies are sorted by most recent activity (most recent first)
5. Top 5 are displayed on the builder card

### Data Flow:
1. When Builders page loads, it fetches:
   - All builders
   - All cohorts
   - **All leads** (for matching)
2. For each builder card, the system:
   - Parses builder's aligned sectors
   - Filters leads by matching sectors
   - Sorts by recency
   - Takes top 5
   - Displays company names

## Benefits

### 1. **Instant Visibility**
- See at a glance which companies are best fits for each builder
- No need to manually cross-reference sectors

### 2. **Time-Saving**
- Automatically surfaces the most relevant and recent opportunities
- Focuses on the 5 most recent matches to avoid information overload

### 3. **Data-Driven Matching**
- Uses actual lead data from your All Leads database
- Updates automatically as new leads are added
- Considers recency to prioritize active opportunities

### 4. **Better Placement Outcomes**
- Match builders to companies with relevant sector experience
- Increase likelihood of successful placements
- Track which sectors have the most opportunities

## Usage Examples

### Example 1: Builder with Healthcare Sector
**Jack Sparrow's Card:**
- Aligned Sectors: Healthcare
- The system finds all leads with "Healthcare" in their aligned sectors
- Sorts them by most recent
- Shows top 5: "Kaiser Permanente, Memorial Sloan Kettering, CVS Health, UnitedHealth Group, Mayo Clinic"

### Example 2: Builder with Multiple Sectors
**Jane Doe's Card:**
- Aligned Sectors: Fintech, E-commerce
- The system finds all leads with either "Fintech" OR "E-commerce"
- Sorts them by most recent
- Shows top 5 across both sectors

### Example 3: New Builder with No Matches
**New Builder Card:**
- Aligned Sectors: Government
- No companies in All Leads have "Government" yet
- Shows: "No matching companies yet. Check All Leads for companies in Government"

## Testing the Feature

1. **Go to Builders Tab**
2. **Look at Jack Sparrow's card** (or any builder with aligned sectors)
3. **You'll see:**
   - "🎯 Aligned Sectors: [sectors]"
   - "Top X Recent Matches:"
   - List of up to 5 company names

4. **Go to All Leads Tab**
5. **Look at Buzz Lightyear's card** (or any lead)
6. **You'll see:**
   - "Status: Sales Pitch Meeting"
   - "Last Contact: Today"
   - **"Sectors: Government, Education"** ← NEW!

## Technical Details

### Frontend Changes:
- **AllLeads.jsx**: Added sectors display in lead card meta section
- **Builders.jsx**: 
  - Added `leads` state to store all leads
  - Updated `fetchData` to fetch leads
  - Added `getMatchingCompanies` function to filter, sort, and limit matches
  - Updated card display to show top 5 companies

### CSS Changes:
- **AllLeads.css**: Added `.all-leads__sectors` styles (blue color for emphasis)
- **Builders.css**: Added styles for:
  - `.builders__matching-companies`
  - `.builders__matches-title`
  - `.builders__company-list`
  - `.builders__company-item`

### Performance:
- All matching is done client-side (no extra API calls)
- Leads are fetched once on page load
- Matching happens in memory for instant results
- Sorting and slicing are O(n log n) operations (very fast)

## Future Enhancements

Potential improvements for later:
1. Click on company name to jump to that lead in All Leads
2. Show lead temperature badges next to company names
3. Add filters to show only hot/warm matches
4. Display number of total matches (e.g., "Top 5 of 12 matches")
5. Allow expanding to see all matches, not just top 5

---

This feature creates a powerful connection between your Builders and Leads databases, making it easy to identify the best opportunities for each builder! 🎯

