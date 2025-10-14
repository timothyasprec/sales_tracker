# Builder Job Search Status & Offer Tracking Features

## Overview
This update adds comprehensive job search tracking to the Builders section, including a color-coded status system, offer details capture, and intelligent company matching based on aligned sectors.

## New Features

### 1. Job Search Status Bar (Colored Progress Stages)

When editing a builder profile, you'll see a horizontal status bar with the following stages:

| Status | Color | Description |
|--------|-------|-------------|
| **Building Resume** | 🔴 Red | Still preparing materials — refining resume, portfolio, LinkedIn, or practicing technical skills |
| **Ready to Apply** | 🟠 Orange | Resume and materials finalized, beginning targeted applications but not yet hearing back |
| **Actively Applying** | 🟡 Yellow | Actively submitting to multiple roles and networking |
| **Interviewing** | 🟢 Light Green | Receiving recruiter calls, technical interviews, or take-home challenges |
| **Offer/Negotiation** | 🟢 Dark Green | In final stages — offers pending, negotiating, or background checks underway |
| **Hired/Placed** | 🟣 Purple | Successfully placed! |
| **Paused/On Hold** | ⚫ Gray | Builder temporarily inactive or focused on other commitments |

**How to Use:**
- Open "Edit Profile" for any builder
- Scroll to the "Job Search Status" section
- Click on the appropriate status button
- The status will be reflected on the builder's card

### 2. Offer Details Form

When a builder reaches **Offer/Negotiation** or **Hired/Placed** status, a special offer details form appears:

**Fields Captured:**
- **Company Name*** - The company making the offer
- **Initial Salary (Pre-Pursuit)** - Builder's salary before joining Pursuit
- **Current Salary*** - The offered/accepted salary
- **Offer Date** - Date the offer was received
- **Start Date** - When the builder will start the new role
- **Additional Notes** - Benefits, relocation packages, remote work details, etc.

This data helps track:
- Salary increases attributable to Pursuit
- Placement success rates
- Time to hire metrics
- Company partnerships

### 3. Enhanced Builder Cards

Builder cards now display:

**Status Badge:**
- Replaces the generic "Active" badge
- Shows the actual job search status with the appropriate color
- Example: "Interviewing" (Light Green) or "Building Resume" (Red)

**Role Information:**
- Displays: "Seeking: [Role Title]"
- Example: "Seeking: Full-Stack Developer"
- More descriptive than the previous "No role specified"

**Aligned Sectors & Company Matching:**
- Shows builder's aligned sectors (e.g., "Government, Education")
- Provides intelligent recommendations:
  - "Companies to explore: Check All Leads tab for companies in Government, Education"
- Helps match builders to relevant opportunities in the All Leads database

### 4. Backend Updates

**Database Changes:**
- Added `job_search_status` column to `builders` table (default: 'building_resume')
- Added offer tracking columns:
  - `offer_company_name`
  - `initial_salary` (DECIMAL)
  - `current_salary` (DECIMAL)
  - `offer_date` (DATE)
  - `start_date` (DATE)
  - `offer_notes` (TEXT)

**API Updates:**
- `createBuilder` endpoint now accepts all new fields
- `updateBuilder` endpoint now supports updating job status and offer details
- All fields properly validated and stored

## Migration

Run the database migration:
```bash
psql -d sales_tracker -f add_builder_job_status.sql
```

This will:
- Add all new columns to the `builders` table
- Create indexes on `job_search_status` and `offer_company_name`
- Add column comments for documentation

## Usage Examples

### Adding a New Builder
1. Click "➕ Add Builder"
2. Fill in all required fields (name, email, cohort, role, etc.)
3. The builder is created with default status: "Building Resume"

### Updating Builder Status
1. Click "Edit Profile" on a builder card
2. Scroll to "Job Search Status" section
3. Click the appropriate status (e.g., "Interviewing")
4. If you select "Offer/Negotiation" or "Hired", the offer details form appears
5. Fill in offer details (company name, salary, dates, etc.)
6. Click "Update Builder"
7. The builder card immediately reflects the new status

### Matching Builders to Companies
1. When editing a builder, select aligned sectors (e.g., Healthcare, Fintech)
2. Save the builder
3. On the builder card, you'll see:
   - "🎯 Aligned Sectors: Healthcare, Fintech"
   - "Companies to explore: Check All Leads tab for companies in Healthcare, Fintech"
4. Go to All Leads tab and filter/search for companies in those sectors
5. Builders with matching sectors are ideal candidates for those opportunities

## Benefits

1. **Better Tracking**: Clear visibility into each builder's job search progress
2. **Data-Driven Insights**: Track placement rates, salary increases, time to hire
3. **Intelligent Matching**: Automatically suggest relevant companies based on builder's sector interests
4. **Success Metrics**: Measure Pursuit's impact through pre/post salary comparisons
5. **Visual Clarity**: Color-coded status makes it easy to see who needs support at a glance

## Notes

- Job Search Status is only visible when **editing** a builder (not when creating)
- Offer Details form only appears when status is "Offer/Negotiation" or "Hired/Placed"
- All new fields are optional except Company Name and Current Salary (when offer section is visible)
- The system automatically suggests matching companies based on aligned sectors

