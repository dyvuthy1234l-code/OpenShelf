import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Tag, Eye, Edit3, Trash2, BookOpen } from 'lucide-react';
import { TABLE_ROW_VARIANTS, TABLE_ROW_ITEM } from '../../../constants/motionTokens';

export default function CategoryTable({ categories = [], onEdit, onDelete }) {
  return (
    <div className="os-panel overflow-hidden border border-slate-200/90 rounded-2xl bg-white shadow-2xs w-full">
      <div className="w-full overflow-x-auto lg:overflow-x-hidden">
        <table className="w-full text-left text-xs align-middle border-collapse table-fixed">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] uppercase tracking-wider text-slate-500 font-bold whitespace-nowrap">
              <th className="py-3.5 px-4 w-[28%]">Category</th>
              <th className="py-3.5 px-4 w-[34%]">Description</th>
              <th className="py-3.5 px-3 w-[14%] text-center">Books Count</th>
              <th className="py-3.5 px-3 w-[10%]">Status</th>
              <th className="py-3.5 px-3 w-[14%] text-right">Actions</th>
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
                <td className="py-3 px-4 whitespace-nowrap min-w-0">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200/80 text-amber-600 flex items-center justify-center font-bold shrink-0">
                      <Tag className="w-3.5 h-3.5" />
                    </div>
                    <Link
                      to={`/librarian/categories/${cat.id}`}
                      className="font-extrabold text-slate-900 hover:text-amber-600 transition-colors truncate block"
                      title={cat.name}
                    >
                      {cat.name}
                    </Link>
                  </div>
                </td>

                {/* Description */}
                <td className="py-3 px-4 text-slate-500 font-normal min-w-0">
                  <span className="truncate block" title={cat.description || ''}>
                    {cat.description || 'No description provided.'}
                  </span>
                </td>

                {/* Books Count */}
                <td className="py-3 px-3 text-center font-bold whitespace-nowrap">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber-50 border border-amber-200/80 text-amber-900 rounded-full text-[11px]">
                    <BookOpen className="w-3 h-3 text-amber-600 shrink-0" />
                    <span>{cat.books_count ?? 0} Books</span>
                  </span>
                </td>

                {/* Status */}
                <td className="py-3 px-3 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider border ${
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

                {/* Actions */}
                <td className="py-3 px-4 text-right whitespace-nowrap">
                  <div className="flex items-center justify-end gap-0.5">
                    <Link
                      to={`/librarian/categories/${cat.id}`}
                      title="View Books in Category"
                      className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </Link>

                    <button
                      onClick={() => onEdit(cat)}
                      title="Edit Category"
                      className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => onDelete(cat)}
                      title="Delete Category"
                      className="p-1 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
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
