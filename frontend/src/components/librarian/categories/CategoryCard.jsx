import { Link } from 'react-router-dom';
import { Tag, Eye, Edit3, Trash2, BookOpen } from 'lucide-react';

export default function CategoryCard({ category, onEdit, onDelete }) {
  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl p-5 space-y-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center font-bold shrink-0">
          <Tag className="w-5 h-5" />
        </div>

        <div className="min-w-0 flex-1 space-y-1">
          <Link
            to={`/librarian/categories/${category.id}`}
            className="font-extrabold text-slate-900 hover:text-amber-700 text-sm block truncate"
          >
            {category.name}
          </Link>

          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
            {category.description || 'No description provided.'}
          </p>
        </div>
      </div>

      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
        <span className="inline-flex items-center gap-1 font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200 text-[11px]">
          <BookOpen className="w-3.5 h-3.5 text-amber-600" />
          {category.books_count ?? 0} Books
        </span>

        <div className="flex items-center gap-1">
          <Link
            to={`/librarian/categories/${category.id}`}
            className="p-1.5 text-slate-500 hover:text-amber-700 hover:bg-amber-50 rounded-xl transition-colors"
          >
            <Eye className="w-4 h-4" />
          </Link>

          <button
            onClick={() => onEdit(category)}
            className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-xl transition-colors"
          >
            <Edit3 className="w-4 h-4" />
          </button>

          <button
            onClick={() => onDelete(category)}
            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
