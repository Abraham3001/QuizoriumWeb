export function showLoading() {
  document.getElementById('loading-overlay').classList.remove('d-none');
}
export function hideLoading() {
  document.getElementById('loading-overlay').classList.add('d-none');
}