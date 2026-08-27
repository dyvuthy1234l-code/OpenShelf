import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Eye, Edit3, Trash2, CheckCircle2, XCircle } from 'lucide-react';
import { TABLE_ROW_VARIANTS, TABLE_ROW_ITEM } from '../../../constants/motionTokens';

export default function BookTable({ books = [], onEdit, onDelete }) {
  return (
    <div className="os-panel overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-full max-w-[800px] text-left text-xs">
          <thead>
            <tr className="bg-navy-50/60 border-b border-brand-border/60 text-[11px] uppercase tracking-wider text-slate-500 font-bold">
              <th className="py-4 px-6">Book</th>
              <th className="py-4 px-4">Author</th>
              <th className="py-4 px-4">Category</th>
              <th className="py-4 px-4">ISBN</th>
              <th className="py-4 px-4 text-center">Total Copies</th>
              <th className="py-4 px-4 text-center">Available</th>
              <th className="py-4 px-4">Status</th>
              <th className="py-4 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <motion.tbody variants={TABLE_ROW_VARIANTS} initial="initial" animate="animate" className="font-medium text-slate-800">
            {books.map((book) => {
              const isAvailable = (book.available_quantity ?? 0) > 0;

              return (
                <motion.tr variants={TABLE_ROW_ITEM} key={book.id} className="border-b border-slate-100 hover:bg-navy-50/40 transition-colors">
                  {/* Book Title & Thumbnail */}
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-14 bg-slate-100 border border-slate-200 rounded-xl overflow-hidden shrink-0 flex items-center justify-center shadow-xs">
                        {book.cover_image_url ? (
                          <img src={book.cover_image_url} alt={book.title} className="w-full h-full object-cover" />
                        ) : (
                          <BookOpen className="w-5 h-5 text-gold-600/60" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <Link
                          to={`/librarian/books/${book.id}`}
                          className="font-extrabold text-slate-900 hover:text-gold-600 transition-colors truncate block max-w-[200px]"
                        >
                          {book.title}
                        </Link>
                        {book.publication_year && (
                          <span className="text-[11px] text-slate-400 block">{book.publication_year}</span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Author */}
                  <td className="py-4 px-4 font-semibold text-slate-700">
                    <span className="truncate max-w-[140px] block">{book.author || 'Unknown'}</span>
                  </td>

                  {/* Category */}
                  <td className="py-4 px-4">
                    {book.category?.name ? (
                      <span className="os-badge-warning">
                        {book.category.name}
                      </span>
                    ) : (
                      <span className="text-slate-400 text-[11px]">—</span>
                    )}
                  </td>

                  {/* ISBN */}
                  <td className="py-4 px-4 text-slate-500 font-mono text-[11px]">
                    {book.isbn || 'N/A'}
                  </td>

                  {/* Total Copies */}
                  <td className="py-4 px-4 text-center font-bold text-slate-900">
                    {book.quantity ?? 1}
                  </td>

                  {/* Available Copies / Stock Status */}
                  <td className="py-4 px-4 text-center">
                    <span
                      className={`os-badge-${isAvailable ? 'success' : 'danger'}`}
                    >
                      {isAvailable ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <XCircle className="w-3 h-3 text-rose-600" />}
                      {isAvailable ? `${book.available_quantity} Available` : 'Out of Stock'}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="py-4 px-4">
                    <span className={`uppercase ${
                      (book.status || 'active') === 'active'
                        ? 'os-badge-success'
                        : (book.status === 'maintenance')
                        ? 'os-badge-warning'
                        : 'os-badge-info'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        (book.status || 'active') === 'active'
                          ? 'bg-emerald-500'
                          : (book.status === 'maintenance')
                          ? 'bg-gold-500'
                          : 'bg-slate-400'
                      }`} />
                      {book.status || 'active'}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-4 px-6 text-right space-x-1">
                    <Link
                      to={`/librarian/books/${book.id}`}
                      title="View Details"
                      className="os-btn-ghost h-8 w-8 px-2"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>

                    <button
                      onClick={() => onEdit(book)}
                      title="Edit Book"
                      className="os-btn-ghost h-8 w-8 px-2"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => onDelete(book)}
                      title="Delete Book"
                      className="os-btn-ghost h-8 w-8 px-2 hover:!text-rose-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
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
