import { Link } from 'react-router-dom';
import { Tag, Eye, Edit3, Trash2, BookOpen } from 'lucide-react';

export default function CategoryTable({ categories = [], onEdit, onDelete }) {
  return (
    <div className="os-panel overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-full max-w-[800px] text-left text-xs">
          <thead>
            <tr className="bg-navy-50/60 border-b border-brand-border/60 text-[11px] uppercase tracking-wider text-slate-500 font-bold">
              <th className="py-4 px-6">Category</th>
              <th className="py-4 px-4">Description</th>
              <th className="py-4 px-4 text-center">Books Count</th>
              <th className="py-4 px-4">Status</th>
              <th className="py-4 px-4">Created Date</th>
              <th className="py-4 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="font-medium text-slate-800">
            {categories.map((cat) => (
              <tr key={cat.id} className="border-b border-slate-100 hover:bg-navy-50/40 transition-colors">
                {/* Category Name & Icon */}
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gold-100 border border-gold-200 text-gold-600 flex items-center justify-center font-bold shrink-0">
                      <Tag className="w-4 h-4" />
                    </div>
                    <Link
                      to={`/librarian/categories/${cat.id}`}
                      className="font-extrabold text-slate-900 hover:text-gold-600 transition-colors truncate max-w-[180px] block"
                    >
                      {cat.name}
                    </Link>
                  </div>
                </td>

                {/* Description */}
                <td className="py-4 px-4 text-slate-500 font-normal">
                  <span className="truncate max-w-[260px] block line-clamp-1">
                    {cat.description || 'No description provided.'}
                  </span>
                </td>

                {/* Books Count */}
                <td className="py-4 px-4 text-center font-bold">
                  <span className="os-badge-info">
                    <BookOpen className="w-3.5 h-3.5 text-gold-600" />
                    <span>{cat.books_count ?? 0} Books</span>
                  </span>
                </td>

                {/* Status */}
                <td className="py-4 px-4">
                  <span className={`capitalize ${
                    (cat.status || 'active') === 'active'
                      ? 'os-badge-success'
                      : 'os-badge-info'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      (cat.status || 'active') === 'active' ? 'bg-emerald-500' : 'bg-slate-400'
                    }`} />
                    {cat.status || 'active'}
                  </span>
                </td>

                {/* Created Date */}
                <td className="py-4 px-4 text-slate-500">
                  {cat.created_at ? new Date(cat.created_at).toLocaleDateString() : 'N/A'}
                </td>

                {/* Actions */}
                <td className="py-4 px-6 text-right space-x-1">
                  <Link
                    to={`/librarian/categories/${cat.id}`}
                    title="View Books in Category"
                    className="os-btn-ghost h-8 w-8 px-2"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>

                  <button
                    onClick={() => onEdit(cat)}
                    title="Edit Category"
                    className="os-btn-ghost h-8 w-8 px-2"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onDelete(cat)}
                    title="Delete Category"
                    className="os-btn-ghost h-8 w-8 px-2 hover:!text-rose-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
