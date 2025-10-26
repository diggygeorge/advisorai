# O*NET API Integration Guide

This guide shows you how to integrate the real O*NET API for comprehensive career data.

## Step 1: Get O*NET API Access

1. **Visit O*NET Center**: Go to [https://www.onetcenter.org/](https://www.onetcenter.org/)
2. **Register for API Access**: 
   - Click on "API Access" or "Developer Resources"
   - Create an account and request API access
   - You'll receive an API key via email

## Step 2: Configure Environment Variables

Add your O*NET API key to your `.env.local` file:

```bash
# O*NET API Configuration
ONET_API_KEY=your_onet_api_key_here

# Existing environment variables
OPENAI_API_KEY=your_openai_api_key_here
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
```

## Step 3: Test the Integration

The system will automatically use O*NET API when available, with fallback to local data.

### Test Commands:

```bash
# Test O*NET API directly
curl -X POST http://localhost:3002/api/onet-career \
  -H "Content-Type: application/json" \
  -d '{"query": "Software Developer"}'

# Test enhanced system
curl -X POST http://localhost:3002/api/enhanced-chatcompletion \
  -H "Content-Type: application/json" \
  -d '{"career": "Data Scientist"}'
```

## Step 4: Verify Integration

1. **Check Console Logs**: Look for messages like:
   - `✅ Found career via O*NET: Software Developer (O*NET API)`
   - `✅ Found career via OOH: Data Scientist (Fallback Data)`

2. **Test Different Careers**: Try various career queries to see O*NET data in action

## How It Works

### API Priority:
1. **O*NET API** (if configured) - Real-time career data
2. **OOH Fallback** - Local career data
3. **Basic Fallback** - Simple recommendations

### Data Sources:
- **O*NET API**: Comprehensive, real-time occupational data
- **OOH Data**: Curated local dataset for common careers
- **University Data**: Your JSON course requirements

### Features:
- **Automatic Fallback**: System works with or without O*NET API
- **Caching**: Reduces API calls for repeated queries
- **Error Handling**: Graceful degradation when APIs fail
- **Source Tracking**: Shows which data source was used

## Troubleshooting

### Common Issues:

1. **"O*NET API key not configured"**
   - Add `ONET_API_KEY` to your `.env.local` file
   - Restart the development server

2. **"No matching career found"**
   - Try different career names (e.g., "Software Engineer" vs "Software Developer")
   - Check if the career exists in O*NET database

3. **API Rate Limits**
   - O*NET has rate limits; the system includes caching to minimize calls
   - Consider implementing additional caching if needed

### Debug Mode:

Add this to your `.env.local` for detailed logging:

```bash
DEBUG_ONET=true
```

## Advanced Configuration

### Custom O*NET Endpoints:

You can modify the O*NET API endpoints in `app/api/onet-career/route.ts`:

```typescript
const ONET_BASE_URL = 'https://services.onetcenter.org/reference/mnm/career/outlook';
```

### Caching Configuration:

Adjust cache settings in the same file:

```typescript
// Cache for O*NET data to avoid repeated API calls
const careerCache = new Map<string, ONetOccupation>();
```

## Benefits of O*NET Integration

1. **Real-time Data**: Always up-to-date career information
2. **Comprehensive Coverage**: Access to 1,000+ occupations
3. **Detailed Skills**: Precise skill requirements and levels
4. **Salary Data**: Current salary and outlook information
5. **Education Requirements**: Accurate educational prerequisites

## Next Steps

1. **Get API Access**: Register with O*NET Center
2. **Add API Key**: Update your environment variables
3. **Test Integration**: Verify everything works
4. **Monitor Usage**: Check API usage and limits
5. **Expand Coverage**: Add more career categories as needed

The system is designed to work seamlessly with or without the O*NET API, so you can start using it immediately and add O*NET integration when ready!
