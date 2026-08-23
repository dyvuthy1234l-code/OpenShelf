import { Link } from 'react-router-dom';
import { Tag, Eye, Edit3, Trash2, BookOpen } from 'lucide-react';

export default function CategoryTable({ categories = [], onEdit, onDelete }) {
  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full min-w-full max-w-[800px] text-left text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200/80 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
              <th className="py-4 px-6">Category</th>
              <th className="py-4 px-4">Description</th>
              <th className="py-4 px-4 text-center">Books Count</th>
              <th className="py-4 px-4">Status</th>
              <th className="py-4 px-4">Created Date</th>
              <th className="py-4 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
            {categories.map((cat) => (
              <tr key={cat.id} className="hover:bg-slate-50/80 transition-colors">
                {/* Category Name & Icon */}
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center font-bold shrink-0">
                      <Tag className="w-4 h-4" />
                    </div>
                    <Link
                      to={`/librarian/categories/${cat.id}`}
                      className="font-extrabold text-slate-900 hover:text-amber-700 transition-colors truncate max-w-[180px] block"
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
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-800 border border-slate-200 text-xs">
                    <BookOpen className="w-3.5 h-3.5 text-amber-600" />
                    <span>{cat.books_count ?? 0} Books</span>
                  </span>
                </td>

                {/* Status */}
                <td className="py-4 px-4">
                  <span className={`inline-flex items-center gap-1 text-[10px] font-extrabold capitalize px-2.5 py-0.5 rounded-full border ${
                    (cat.status || 'active') === 'active'
                      ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                      : 'text-slate-600 bg-slate-100 border-slate-200'
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
                    className="inline-block p-1.5 text-slate-500 hover:text-amber-700 hover:bg-amber-50 rounded-xl transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>

                  <button
                    onClick={() => onEdit(cat)}
                    title="Edit Category"
                    className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-xl transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onDelete(cat)}
                    title="Delete Category"
                    className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
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
