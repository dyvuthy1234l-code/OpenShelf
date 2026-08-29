import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Eye, Edit3, Trash2, CheckCircle2, XCircle } from 'lucide-react';
import { TABLE_ROW_VARIANTS, TABLE_ROW_ITEM } from '../../../constants/motionTokens';

export default function BookTable({ books = [], onEdit, onDelete }) {
  return (
    <div className="os-panel overflow-hidden border border-slate-200/90 rounded-2xl bg-white shadow-2xs w-full">
      <div className="w-full overflow-x-auto lg:overflow-x-hidden">
        <table className="w-full text-left text-xs align-middle border-collapse table-fixed">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] uppercase tracking-wider text-slate-500 font-bold whitespace-nowrap">
              <th className="py-3.5 px-4 w-[28%]">Book</th>
              <th className="py-3.5 px-3 w-[15%]">Author</th>
              <th className="py-3.5 px-3 w-[13%]">Category</th>
              <th className="py-3.5 px-3 w-[12%]">ISBN</th>
              <th className="py-3.5 px-2 w-[6%] text-center">Copies</th>
              <th className="py-3.5 px-3 w-[11%] text-center">Available</th>
              <th className="py-3.5 px-3 w-[8%]">Status</th>
              <th className="py-3.5 px-4 w-[7%] text-right">Actions</th>
            </tr>
          </thead>
          <motion.tbody
            variants={TABLE_ROW_VARIANTS}
            initial="initial"
            animate="animate"
            className="font-medium text-slate-800 divide-y divide-slate-100"
          >
            {books.map((book) => {
              const isAvailable = (book.available_quantity ?? 0) > 0;

              return (
                <motion.tr
                  variants={TABLE_ROW_ITEM}
                  key={book.id}
                  className="hover:bg-slate-50/80 transition-colors"
                >
                  {/* Book Title & Prominent Rectangular Cover (Not Circle) */}
                  <td className="py-3 px-4 min-w-0">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-14 h-18 bg-slate-100 border border-slate-200 rounded-lg overflow-hidden shrink-0 flex items-center justify-center shadow-xs">
                        {book.cover_image_url ? (
                          <img src={book.cover_image_url} alt={book.title} className="w-full h-full object-cover" />
                        ) : (
                          <BookOpen className="w-6 h-6 text-amber-500/80" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <Link
                          to={`/librarian/books/${book.id}`}
                          className="font-extrabold text-slate-900 hover:text-amber-600 transition-colors truncate block text-xs"
                          title={book.title}
                        >
                          {book.title}
                        </Link>
                        {book.publication_year && (
                          <span className="text-[10px] text-slate-400 block leading-tight">{book.publication_year}</span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Author */}
                  <td className="py-3 px-3 font-semibold text-slate-700 whitespace-nowrap min-w-0 text-xs">
                    <span className="truncate block" title={book.author || 'Unknown'}>
                      {book.author || 'Unknown'}
                    </span>
                  </td>

                  {/* Category */}
                  <td className="py-3 px-3 whitespace-nowrap min-w-0">
                    {book.category?.name ? (
                      <span
                        className="inline-flex items-center px-2.5 py-0.5 bg-amber-50 border border-amber-200/80 text-amber-800 rounded-md text-[11px] font-bold truncate max-w-full"
                        title={book.category.name}
                      >
                        {book.category.name}
                      </span>
                    ) : (
                      <span className="text-slate-400 text-[11px]">—</span>
                    )}
                  </td>

                  {/* ISBN */}
                  <td className="py-3 px-3 text-slate-500 font-mono text-[11px] whitespace-nowrap min-w-0">
                    <span className="truncate block" title={book.isbn || 'N/A'}>
                      {book.isbn || 'N/A'}
                    </span>
                  </td>

                  {/* Total Copies */}
                  <td className="py-3 px-2 text-center font-bold text-slate-900 whitespace-nowrap text-xs">
                    {book.quantity ?? 1}
                  </td>

                  {/* Available Copies / Stock Status */}
                  <td className="py-3 px-3 text-center whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-bold border ${
                        isAvailable
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}
                    >
                      {isAvailable ? (
                        <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                      ) : (
                        <XCircle className="w-3 h-3 text-rose-600 shrink-0" />
                      )}
                      <span>{isAvailable ? `${book.available_quantity} Avail` : 'Out of Stock'}</span>
                    </span>
                  </td>

                  {/* Status */}
                  <td className="py-3 px-3 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[9px] font-extrabold uppercase tracking-wider border ${
                        (book.status || 'active') === 'active'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : book.status === 'maintenance'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          (book.status || 'active') === 'active'
                            ? 'bg-emerald-500'
                            : book.status === 'maintenance'
                            ? 'bg-amber-500'
                            : 'bg-slate-400'
                        }`}
                      />
                      {book.status || 'active'}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        to={`/librarian/books/${book.id}`}
                        title="View Details"
                        className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>

                      <button
                        onClick={() => onEdit(book)}
                        title="Edit Book"
                        className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => onDelete(book)}
                        title="Delete Book"
                        className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              );
            })}
          </motion.tbody>
        </table>
      </div>
    </div>
  );
}
