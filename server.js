const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3002;

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// ============= HELPER FUNCTIONS =============
const handleError = (res, error, message = 'Server error') => {
  console.error(message, error);
  res.status(500).json({ error: message, details: error.message });
};

const validateRequired = (fields, body) => {
  const missing = fields.filter(field => !body[field]);
  if (missing.length > 0) {
    return `Missing required fields: ${missing.join(', ')}`;
  }
  return null;
};

// ============= HEALTH CHECK =============
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Roaring Tigers API is running with Supabase' });
});

// ============= DEBUG ENDPOINT FOR RMS =============
app.get('/debug-rms', async (req, res) => {
  try {
    // Test 1: Check if table exists and get count
    const { count, error: countError } = await supabase
      .from('rms')
      .select('*', { count: 'exact', head: true });
    
    // Test 2: Try to get actual data (excluding password_hash)
    const { data: actualData, error: dataError } = await supabase
      .from('rms')
      .select('id, name, phone, email, join_date, status');
    
    res.json({
      status: 'Debug endpoint working',
      table_check: {
        exists: !countError,
        error: countError ? countError.message : null,
        row_count: count || 0
      },
      data_check: {
        success: !dataError,
        error: dataError ? dataError.message : null,
        row_count: actualData ? actualData.length : 0,
        sample: actualData ? actualData.slice(0, 2) : []
      },
      full_data: actualData || []
    });
  } catch (err) {
    res.status(500).json({ 
      error: 'Server error in debug endpoint', 
      details: err.message,
      stack: err.stack
    });
  }
});

// ============= RMS ENDPOINTS =============
// Get all RMs (excluding password_hash for security)
app.get('/rms', async (req, res) => {
  try {
    console.log('Fetching all RMs...');
    const { data, error } = await supabase
      .from('rms')
      .select('id, name, phone, email, join_date, status')
      .order('id');
    
    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }
    console.log(`Found ${data?.length || 0} RMs`);
    res.json(data || []);
  } catch (err) {
    console.error('Error in /rms endpoint:', err);
    handleError(res, err, 'Error fetching RMs');
  }
});

// Get RM by ID (excluding password_hash)
app.get('/rms/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('rms')
      .select('id, name, phone, email, join_date, status')
      .eq('id', req.params.id)
      .single();
    
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'RM not found' });
    res.json(data);
  } catch (err) {
    handleError(res, err, 'Error fetching RM');
  }
});

// Create new RM (including password_hash)
app.post('/rms', async (req, res) => {
  try {
    const missing = validateRequired(['name', 'phone', 'email', 'password_hash'], req.body);
    if (missing) return res.status(400).json({ error: missing });
    
    const { data, error } = await supabase
      .from('rms')
      .insert([req.body])
      .select('id, name, phone, email, join_date, status')
      .single();
    
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    handleError(res, err, 'Error creating RM');
  }
});

// Update RM
app.put('/rms/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('rms')
      .update(req.body)
      .eq('id', req.params.id)
      .select('id, name, phone, email, join_date, status')
      .single();
    
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'RM not found' });
    res.json(data);
  } catch (err) {
    handleError(res, err, 'Error updating RM');
  }
});

// Delete RM
app.delete('/rms/:id', async (req, res) => {
  try {
    const { error } = await supabase
      .from('rms')
      .delete()
      .eq('id', req.params.id);
    
    if (error) throw error;
    res.status(204).send();
  } catch (err) {
    handleError(res, err, 'Error deleting RM');
  }
});

// ============= LOGIN ENDPOINT =============
app.post('/login', async (req, res) => {
  try {
    const { phone, password } = req.body;
    
    if (!phone || !password) {
      return res.status(400).json({ error: 'Phone and password required' });
    }
    
    const { data, error } = await supabase
      .from('rms')
      .select('id, name, phone, email, join_date, status')
      .eq('phone', phone)
      .eq('password_hash', password)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      throw error;
    }
    
    if (!data) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    res.json({ 
      success: true, 
      message: 'Login successful',
      user: data 
    });
  } catch (err) {
    handleError(res, err, 'Error during login');
  }
});

// ============= CHANNEL PARTNERS ENDPOINTS =============
app.get('/channel_partners', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('channel_partners')
      .select('*')
      .order('id');
    
    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    handleError(res, err, 'Error fetching channel partners');
  }
});

app.get('/channel_partners/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('channel_partners')
      .select('*')
      .eq('id', req.params.id)
      .single();
    
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Channel partner not found' });
    res.json(data);
  } catch (err) {
    handleError(res, err, 'Error fetching channel partner');
  }
});

app.post('/channel_partners', async (req, res) => {
  try {
    const missing = validateRequired(['name', 'phone'], req.body);
    if (missing) return res.status(400).json({ error: missing });
    
    const { data, error } = await supabase
      .from('channel_partners')
      .insert([req.body])
      .select()
      .single();
    
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    handleError(res, err, 'Error creating channel partner');
  }
});

app.put('/channel_partners/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('channel_partners')
      .update(req.body)
      .eq('id', req.params.id)
      .select()
      .single();
    
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Channel partner not found' });
    res.json(data);
  } catch (err) {
    handleError(res, err, 'Error updating channel partner');
  }
});

app.delete('/channel_partners/:id', async (req, res) => {
  try {
    const { error } = await supabase
      .from('channel_partners')
      .delete()
      .eq('id', req.params.id);
    
    if (error) throw error;
    res.status(204).send();
  } catch (err) {
    handleError(res, err, 'Error deleting channel partner');
  }
});

// ============= SALES ENDPOINTS =============
app.get('/sales', async (req, res) => {
  try {
    let query = supabase.from('sales').select('*');
    
    // Filter by rm_id if provided
    if (req.query.rm_id) {
      query = query.eq('rm_id', req.query.rm_id);
    }
    
    // Filter by date range if provided
    if (req.query.start_date) {
      query = query.gte('sale_date', req.query.start_date);
    }
    if (req.query.end_date) {
      query = query.lte('sale_date', req.query.end_date);
    }
    
    const { data, error } = await query.order('sale_date', { ascending: false });
    
    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    handleError(res, err, 'Error fetching sales');
  }
});

app.get('/sales/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('sales')
      .select('*')
      .eq('id', req.params.id)
      .single();
    
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Sale not found' });
    res.json(data);
  } catch (err) {
    handleError(res, err, 'Error fetching sale');
  }
});

app.post('/sales', async (req, res) => {
  try {
    const missing = validateRequired(['rm_id', 'cp_id', 'applicant1_name', 'amount'], req.body);
    if (missing) return res.status(400).json({ error: missing });
    
    const { data, error } = await supabase
      .from('sales')
      .insert([req.body])
      .select()
      .single();
    
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    handleError(res, err, 'Error creating sale');
  }
});

app.put('/sales/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('sales')
      .update(req.body)
      .eq('id', req.params.id)
      .select()
      .single();
    
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Sale not found' });
    res.json(data);
  } catch (err) {
    handleError(res, err, 'Error updating sale');
  }
});

app.delete('/sales/:id', async (req, res) => {
  try {
    const { error } = await supabase
      .from('sales')
      .delete()
      .eq('id', req.params.id);
    
    if (error) throw error;
    res.status(204).send();
  } catch (err) {
    handleError(res, err, 'Error deleting sale');
  }
});

// ============= MEETINGS ENDPOINTS =============
app.get('/meetings', async (req, res) => {
  try {
    let query = supabase.from('meetings').select('*');
    
    if (req.query.rm_id) {
      query = query.eq('rm_id', req.query.rm_id);
    }
    
    const { data, error } = await query.order('meeting_date', { ascending: false });
    
    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    handleError(res, err, 'Error fetching meetings');
  }
});

app.post('/meetings', async (req, res) => {
  try {
    const missing = validateRequired(['rm_id', 'meeting_date'], req.body);
    if (missing) return res.status(400).json({ error: missing });
    
    const { data, error } = await supabase
      .from('meetings')
      .insert([req.body])
      .select()
      .single();
    
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    handleError(res, err, 'Error creating meeting');
  }
});

// ============= KPI TARGETS ENDPOINTS =============
app.get('/kpi_targets', async (req, res) => {
  try {
    let query = supabase.from('kpi_targets').select('*');
    
    if (req.query.rm_id) {
      query = query.eq('rm_id', req.query.rm_id);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    handleError(res, err, 'Error fetching KPI targets');
  }
});

app.post('/kpi_targets', async (req, res) => {
  try {
    const missing = validateRequired(['rm_id', 'kpi_type'], req.body);
    if (missing) return res.status(400).json({ error: missing });
    
    const { data, error } = await supabase
      .from('kpi_targets')
      .insert([req.body])
      .select()
      .single();
    
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    handleError(res, err, 'Error creating KPI target');
  }
});

// ============= TARGETS ENDPOINT (for backward compatibility) =============
app.get('/targets', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('targets')
      .select('*');
    
    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    // If targets table doesn't exist, return empty array
    console.log('Targets table might not exist, returning empty array');
    res.json([]);
  }
});

app.get('/targets/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('targets')
      .select('*')
      .eq('id', req.params.id)
      .single();
    
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Target not found' });
    res.json(data);
  } catch (err) {
    handleError(res, err, 'Error fetching target');
  }
});

// ============= ROOT ENDPOINT =============
app.get('/', (req, res) => {
  res.json({
    error: 'Not found',
    message: 'Available endpoints: /health, /login, /debug-rms, /rms, /channel_partners, /meetings, /sales, /targets, /kpi_targets'
  });
});

// ============= START SERVER =============
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📊 Available endpoints:`);
  console.log(`   - /health`);
  console.log(`   - /login`);
  console.log(`   - /debug-rms`);
  console.log(`   - /rms`);
  console.log(`   - /channel_partners`);
  console.log(`   - /meetings`);
  console.log(`   - /sales`);
  console.log(`   - /targets`);
  console.log(`   - /kpi_targets`);
  console.log(`🌐 CORS enabled for all origins`);
  console.log(`🔌 Connected to Supabase: ${supabaseUrl ? 'Yes' : 'No'}`);
});
