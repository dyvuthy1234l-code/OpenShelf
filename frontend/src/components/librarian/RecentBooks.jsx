import { Link } from 'react-router-dom';
import { BookOpen, ArrowRight, CheckCircle2, XCircle } from 'lucide-react';

export default function RecentBooks({ books = [] }) {
  if (books.length === 0) {
    return (
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h3 className="text-lg font-extrabold text-slate-900">Recently Added Books</h3>
          <Link to="/librarian/books" className="text-xs font-bold text-amber-700 hover:text-amber-800">
            View Books Catalogue →
          </Link>
        </div>

        <div className="py-8 text-center text-slate-400 text-xs italic">
          No books added yet. Click "Books" in the sidebar to add your first volume.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 space-y-5 shadow-xs">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-lg font-extrabold text-slate-900">Recently Added Books</h3>
          <p className="text-xs text-slate-500 mt-0.5">Latest physical books added to your library</p>
        </div>

        <Link
          to="/librarian/books"
          className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 hover:text-amber-800"
        >
          <span>View Books</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {books.map((book) => {
          const isAvailable = (book.available_quantity ?? book.quantity ?? 0) > 0;

          return (
            <div
              key={book.id}
              className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-4 flex flex-col justify-between space-y-3 hover:bg-white hover:border-amber-500/50 transition-all shadow-xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-16 bg-white border border-slate-200 rounded-xl overflow-hidden shrink-0 flex items-center justify-center shadow-xs">
                  {book.cover_image_url ? (
                    <img src={book.cover_image_url} alt={book.title} className="w-full h-full object-cover" />
                  ) : (
                    <BookOpen className="w-6 h-6 text-amber-600/60" />
                  )}
                </div>

                <div className="min-w-0 flex-1 space-y-0.5">
                  <h4 className="text-xs font-bold text-slate-900 truncate">{book.title}</h4>
                  {book.author && <p className="text-[11px] text-slate-500 truncate">By {book.author}</p>}
                  {book.category?.name && (
                    <span className="inline-block text-[9px] uppercase font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      {book.category.name}
                    </span>
                  )}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                {isAvailable ? (
                  <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
                    <CheckCircle2 className="w-3 h-3" />
                    {book.available_quantity} copies
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-rose-600 font-bold">
                    <XCircle className="w-3 h-3" />
                    Borrowed
                  </span>
                )}

                <span className="text-slate-400">
                  {book.created_at ? new Date(book.created_at).toLocaleDateString() : ''}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
