// Handle GitHub Pages SPA redirect
const redirect = sessionStorage.redirect;
if (redirect) {
  delete sessionStorage.redirect;
  const url = new URL(redirect);
  history.replaceState(null, '', url.pathname + url.search + url.hash);
}
