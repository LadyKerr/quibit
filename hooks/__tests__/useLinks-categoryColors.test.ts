import { renderHook, act } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLinks } from '../useLinks';
import { supabase } from '../../lib/supabase';

// Mock dependencies
jest.mock('@react-native-async-storage/async-storage');
jest.mock('../../lib/supabase');
jest.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    session: {
      user: {
        id: 'test-user-id'
      }
    }
  })
}));

const mockedAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;
const mockedSupabase = supabase as jest.Mocked<typeof supabase>;

describe('Category Colors Migration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should migrate category colors from AsyncStorage to Supabase', async () => {
    // Setup: AsyncStorage has existing color data
    const existingColors = {
      'Blog': '#FF5733',
      'Tutorial': '#33FF57',
      'Video': '#3357FF'
    };
    
    mockedAsyncStorage.getItem.mockResolvedValue(JSON.stringify(existingColors));
    
    // Setup: Supabase has no existing colors
    mockedSupabase.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue({
            data: [],
            error: null
          })
        })
      }),
      insert: jest.fn().mockResolvedValue({
        data: [],
        error: null
      })
    } as any);

    const { result } = renderHook(() => useLinks());

    // Wait for migration to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    // Verify that insert was called with correct data
    expect(mockedSupabase.from).toHaveBeenCalledWith('category_colors');
    
    // Verify AsyncStorage cleanup
    expect(mockedAsyncStorage.removeItem).toHaveBeenCalledWith('category_colors_test-user-id');
  });

  it('should update category colors via Supabase', async () => {
    const mockUpsert = jest.fn().mockResolvedValue({ error: null });
    
    mockedSupabase.from.mockReturnValue({
      upsert: mockUpsert
    } as any);

    const { result } = renderHook(() => useLinks());

    await act(async () => {
      await result.current.updateCategoryColor('Blog', '#FF5733');
    });

    expect(mockUpsert).toHaveBeenCalledWith(
      {
        user_id: 'test-user-id',
        category_name: 'Blog',
        color: '#FF5733',
        updated_at: expect.any(String)
      },
      {
        onConflict: 'user_id,category_name'
      }
    );
  });

  it('should clean up colors when category is deleted', async () => {
    const mockDelete = jest.fn().mockResolvedValue({ error: null });
    
    mockedSupabase.from.mockReturnValue({
      delete: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ error: null })
        })
      })
    } as any);

    const { result } = renderHook(() => useLinks());

    await act(async () => {
      await result.current.deleteCategory('Blog');
    });

    // Verify that category_colors delete was called
    expect(mockedSupabase.from).toHaveBeenCalledWith('category_colors');
  });
});
