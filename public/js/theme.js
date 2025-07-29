(function() {
  const savedTheme = localStorage.getItem('tema') || 'light';
  document.body.classList.toggle('dark', savedTheme === 'dark');
})();
