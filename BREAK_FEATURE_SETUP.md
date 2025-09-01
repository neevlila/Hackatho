# Break/Recess Feature Setup Guide

This guide explains how to set up and use the new break/recess functionality in the EduScheduler application.

## Overview

The break feature allows administrators to:
- Configure break times (lunch, recess, etc.)
- Set which days of the week breaks occur
- Automatically include breaks in generated timetables
- Visualize breaks in the timetable grid

## Database Setup

### 1. Run the Migrations

Execute these SQL migrations in your Supabase database:

#### Migration 1: Create Breaks Table
```sql
-- File: supabase/migrations/20250121000001_create_breaks_table.sql
-- This creates the breaks table with proper RLS policies
```

#### Migration 2: Update Time Slots
```sql
-- File: supabase/migrations/20250121000002_update_time_slots_for_breaks.sql
-- This adds break support to existing time_slots table
```

### 2. Verify Table Structure

After running migrations, you should have:

**Breaks Table:**
- `id` - Unique identifier
- `name` - Break name (e.g., "Lunch Break")
- `start_time` - Start time (HH:MM format)
- `end_time` - End time (HH:MM format)
- `days` - Array of days (e.g., ["Monday", "Tuesday"])
- `user_id` - Reference to auth.users
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

**Time Slots Table (Updated):**
- All existing fields
- `is_break` - Boolean flag for break slots
- `break_name` - Name of the break (nullable)

## Features

### 1. Break Management

Navigate to **Breaks** in the sidebar to:
- Add new breaks with custom names
- Set start and end times
- Choose which days the break occurs
- View break duration automatically calculated
- Delete existing breaks

### 2. Timetable Integration

When generating timetables:
- Breaks are automatically included based on your configuration
- Break slots are visually distinct (orange background)
- Break times are respected and won't conflict with classes
- Each break shows the break name and "Recess Time" label

### 3. Visual Indicators

In the timetable grid:
- **Regular Classes**: Blue background with subject details
- **Breaks**: Orange background with coffee icon and break name
- **Empty Slots**: White/transparent background

## Usage Examples

### Example 1: Lunch Break
- **Name**: "Lunch Break"
- **Time**: 12:00 - 13:00
- **Days**: Monday, Tuesday, Wednesday, Thursday, Friday
- **Result**: 1-hour lunch break every weekday

### Example 2: Morning Recess
- **Name**: "Morning Recess"
- **Time**: 10:30 - 10:45
- **Days**: Monday, Wednesday, Friday
- **Result**: 15-minute break on alternate days

### Example 3: Afternoon Break
- **Name**: "Afternoon Break"
- **Time**: 15:00 - 15:15
- **Days**: Tuesday, Thursday
- **Result**: 15-minute break on specific days

## Troubleshooting

### Common Issues

1. **Breaks not appearing in timetable**
   - Ensure breaks are configured for the correct user
   - Check that break times don't conflict with class times
   - Verify the breaks table has data

2. **Database errors**
   - Run migrations in order
   - Check Supabase logs for detailed error messages
   - Ensure RLS policies are properly configured

3. **Break times not matching**
   - Verify time format (HH:MM)
   - Check timezone settings
   - Ensure start time is before end time

### Debug Steps

1. **Check Console Logs**
   - Open browser developer tools
   - Look for data fetching logs
   - Check for error messages

2. **Verify Data**
   - Use Supabase dashboard to check table contents
   - Verify user authentication
   - Check RLS policies

3. **Test Break Creation**
   - Try creating a simple break first
   - Use default values to isolate issues
   - Check network requests in dev tools

## Best Practices

### 1. Break Naming
- Use descriptive names (e.g., "Lunch Break" not just "Break")
- Keep names concise but clear
- Use consistent naming conventions

### 2. Time Management
- Avoid overlapping break times
- Consider class duration when setting break times
- Leave adequate time between classes and breaks

### 3. Day Selection
- Be consistent with break days
- Consider academic schedules
- Plan for special events or holidays

## Advanced Configuration

### 1. Custom Break Types
You can create different types of breaks:
- **Academic Breaks**: Between classes
- **Meal Breaks**: Lunch, dinner
- **Recreation Breaks**: Physical activity time
- **Administrative Breaks**: Staff meetings, etc.

### 2. Break Scheduling
- Breaks are automatically scheduled during timetable generation
- The system ensures no conflicts with classes
- Breaks respect faculty and classroom availability

### 3. Export Integration
- Breaks are included in PDF exports
- Breaks are included in Excel exports
- Break information is preserved in all formats

## Support

If you encounter issues:

1. **Check the console** for error messages
2. **Verify database setup** with migrations
3. **Test with simple data** to isolate issues
4. **Review RLS policies** for permission issues
5. **Check Supabase logs** for backend errors

## Future Enhancements

Potential improvements for the break system:
- Break templates for common scenarios
- Bulk break creation
- Break conflict detection
- Break statistics and reporting
- Integration with academic calendars
