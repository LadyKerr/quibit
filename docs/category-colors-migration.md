# Category Colors Migration to Supabase

## Overview
This migration moves category colors storage from AsyncStorage to Supabase for better consistency with the rest of the application's data persistence layer.

## Changes Made

### 1. Database Schema Update
- Added `category_colors` table to store user-specific category colors
- Includes proper RLS (Row Level Security) policies
- Added indexes for performance optimization

### 2. useLinks Hook Updates
- Modified `loadCategories()` to fetch colors from Supabase instead of AsyncStorage
- Updated `updateCategoryColor()` to use Supabase upsert operation
- Added automatic migration function to move existing AsyncStorage data to Supabase
- Enhanced `deleteCategory()` to clean up associated colors
- Enhanced `editCategory()` to update color associations when categories are renamed

### 3. Type System Updates
- Added `category_colors` table definition to the Database interface in `lib/types.ts`

## Migration Process

The migration happens automatically when a user loads the app:

1. **Automatic Detection**: When `loadCategories()` is called, it checks for existing AsyncStorage data
2. **One-time Migration**: If AsyncStorage data exists and Supabase has no colors, it migrates the data
3. **Cleanup**: After successful migration, AsyncStorage data is removed
4. **Seamless Experience**: Users won't notice any difference in functionality

## Database Structure

```sql
CREATE TABLE category_colors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_name TEXT NOT NULL,
  color TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, category_name)
);
```

## Benefits

1. **Consistency**: All app data now uses Supabase for persistence
2. **Cross-device Sync**: Category colors will sync across user devices
3. **Backup & Recovery**: Colors are included in database backups
4. **Better Performance**: Leverages Supabase's optimized query engine
5. **Offline Support**: Supabase handles offline caching automatically

## Implementation Notes

- The migration is non-destructive and happens only once per user
- Existing functionality remains unchanged from the user's perspective
- RLS policies ensure data security and user isolation
- Proper error handling prevents data loss during migration
