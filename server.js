const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError('');

  try {
    console.log('Attempting login with:', { phone, password });
    
    // Call your new login endpoint
    const response = await fetch('https://roaring-tigers-backend.onrender.com/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ phone, password }),
    });

    const data = await response.json();
    console.log('Login response:', data);

    if (response.ok && data.success) {
      // Store user data in session
      sessionStorage.setItem('user', JSON.stringify(data.user));
      
      // Redirect based on role (admin or rm)
      if (data.user.phone === '9876543210') { // You can adjust this logic
        navigate('/admin/dashboard');
      } else {
        navigate('/rm/dashboard');
      }
    } else {
      setError(data.error || 'Invalid phone or password');
    }
  } catch (err) {
    console.error('Login error:', err);
    setError('Network error. Please try again.');
  } finally {
    setLoading(false);
  }
};
