import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Tag, Eye, Edit3, Trash2, BookOpen } from 'lucide-react';
import { TABLE_ROW_VARIANTS, TABLE_ROW_ITEM } from '../../../constants/motionTokens';

export default function CategoryTable({ categories = [], onEdit, onDelete }) {
  return (
    <div className="os-panel overflow-hidden border border-slate-200/90 rounded-2xl bg-white shadow-2xs">
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full text-left text-xs align-middle border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] uppercase tracking-wider text-slate-500 font-bold whitespace-nowrap">
              <th className="py-3.5 px-5">Category</th>
              <th className="py-3.5 px-4">Description</th>
              <th className="py-3.5 px-4 text-center">Books Count</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4">Created Date</th>
              <th className="py-3.5 px-5 text-right">Actions</th>
            </tr>
          </thead>
          <motion.tbody
            variants={TABLE_ROW_VARIANTS}
            initial="initial"
            animate="animate"
            className="font-medium text-slate-800 divide-y divide-slate-100"
          >
            {categories.map((cat) => (
              <motion.tr
                variants={TABLE_ROW_ITEM}
                key={cat.id}
                className="hover:bg-slate-50/80 transition-colors"
              >
                {/* Category Name & Icon */}
                <td className="py-3 px-5 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-600 flex items-center justify-center font-bold shrink-0">
                      <Tag className="w-4 h-4" />
                    </div>
                    <Link
                      to={`/librarian/categories/${cat.id}`}
                      className="font-extrabold text-slate-900 hover:text-amber-600 transition-colors truncate max-w-[200px] block"
                      title={cat.name}
                    >
                      {cat.name}
                    </Link>
                  </div>
                </td>

                {/* Description */}
                <td className="py-3 px-4 text-slate-500 font-normal">
                  <span className="truncate max-w-[320px] block line-clamp-1" title={cat.description || ''}>
                    {cat.description || 'No description provided.'}
                  </span>
                </td>

                {/* Books Count */}
                <td className="py-3 px-4 text-center font-bold whitespace-nowrap">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-amber-200/80 text-amber-900 rounded-full text-[11px]">
                    <BookOpen className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>{cat.books_count ?? 0} Books</span>
                  </span>
                </td>

                {/* Status */}
                <td className="py-3 px-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${
                      (cat.status || 'active') === 'active'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        (cat.status || 'active') === 'active' ? 'bg-emerald-500' : 'bg-slate-400'
                      }`}
                    />
                    {cat.status || 'active'}
                  </span>
                </td>

                {/* Created Date */}
                <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                  {cat.created_at ? new Date(cat.created_at).toLocaleDateString() : 'N/A'}
                </td>

                {/* Actions */}
                <td className="py-3 px-5 text-right whitespace-nowrap">
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      to={`/librarian/categories/${cat.id}`}
                      title="View Books in Category"
                      className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>

                    <button
                      onClick={() => onEdit(cat)}
                      title="Edit Category"
                      className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => onDelete(cat)}
                      title="Delete Category"
                      className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </motion.tbody>
        </table>
      </div>
    </div>
  );
}
