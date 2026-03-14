## Logout Redirect Fix TODO

**Current Status:** Plan approved - Change logout redirect from home ('/') to login ('/login').

### Steps:

- [x] Step 1: Edit frontend/src/components/Header.tsx - Replace `navigate('/')` with `navigate('/login')` in handleLogout function.
- [x] Step 2: Verified - Header.tsx updated successfully, ready to test with `cd frontend && npm run dev`.
- [x] Step 3: Task complete.

**Status:** ✅ Done!
