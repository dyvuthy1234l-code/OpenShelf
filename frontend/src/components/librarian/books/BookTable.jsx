import { Link } from 'react-router-dom';
import { BookOpen, Eye, Edit3, Trash2, CheckCircle2, XCircle } from 'lucide-react';

export default function BookTable({ books = [], onEdit, onDelete }) {
  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200/80 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
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
          <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
            {books.map((book) => {
              const isAvailable = (book.available_quantity ?? 0) > 0;

              return (
                <tr key={book.id} className="hover:bg-slate-50/80 transition-colors">
                  {/* Book Title & Thumbnail */}
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-14 bg-slate-100 border border-slate-200 rounded-xl overflow-hidden shrink-0 flex items-center justify-center shadow-xs">
                        {book.cover_image_url ? (
                          <img src={book.cover_image_url} alt={book.title} className="w-full h-full object-cover" />
                        ) : (
                          <BookOpen className="w-5 h-5 text-amber-600/60" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <Link
                          to={`/librarian/books/${book.id}`}
                          className="font-extrabold text-slate-900 hover:text-amber-700 transition-colors truncate block max-w-[200px]"
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
                      <span className="inline-block text-[10px] uppercase font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
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
                      className={`inline-flex items-center gap-1 font-bold text-xs px-2.5 py-0.5 rounded-full ${
                        isAvailable
                          ? 'text-emerald-700 bg-emerald-50 border border-emerald-200'
                          : 'text-rose-700 bg-rose-50 border border-rose-200'
                      }`}
                    >
                      {isAvailable ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <XCircle className="w-3 h-3 text-rose-600" />}
                      {isAvailable ? `${book.available_quantity} Available` : 'Out of Stock'}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="py-4 px-4">
                    <span className={`inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${
                      (book.status || 'active') === 'active'
                        ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                        : (book.status === 'maintenance')
                        ? 'text-amber-800 bg-amber-50 border-amber-200'
                        : 'text-slate-600 bg-slate-100 border-slate-200'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        (book.status || 'active') === 'active'
                          ? 'bg-emerald-500'
                          : (book.status === 'maintenance')
                          ? 'bg-amber-500'
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
                      className="inline-block p-1.5 text-slate-500 hover:text-amber-700 hover:bg-amber-50 rounded-xl transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>

                    <button
                      onClick={() => onEdit(book)}
                      title="Edit Book"
                      className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-xl transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => onDelete(book)}
                      title="Delete Book"
                      className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
