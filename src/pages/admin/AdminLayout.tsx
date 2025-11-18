import { Link, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const AdminLayout = () => {
  const { signOut, profile } = useAuth();
  return (
    <div className="min-h-screen flex">
      <aside className="w-64 border-r p-4 flex flex-col bg-background/50">
        <div className="flex items-center justify-between">
          <Link to="/" className="font-semibold">Home</Link>
        </div>
        <nav className="mt-6 space-y-2">
          <Link to="/admin/templates" className="block px-3 py-2 rounded hover:bg-muted font-medium">Templates</Link>
          <Link to="/admin/payments" className="block px-3 py-2 rounded hover:bg-muted font-medium">Payments</Link>
          <Link to="/admin/contact" className="block px-3 py-2 rounded hover:bg-muted font-medium">Contact</Link>
        </nav>
        <div className="mt-auto pt-4 border-t flex items-center justify-between">
          <span className="text-sm text-muted-foreground">{profile?.role}</span>
          <button className="border rounded px-3 py-1" onClick={() => signOut()}>Sign out</button>
        </div>
      </aside>
      <div className="flex-1">
        <main className="p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
