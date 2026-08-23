const fs = require('fs');
let content = fs.readFileSync('src/pages/member/MemberProfile.jsx', 'utf8');
content = content.replace(/className="px-6 py-2\.5 bg-amber-500/g, 'className="w-full sm:w-auto px-6 py-2.5 bg-amber-500');
content = content.replace(/className="px-6 py-2\.5 bg-slate-800/g, 'className="w-full sm:w-auto px-6 py-2.5 bg-slate-800');
content = content.replace(/className="px-4 py-2\.5 bg-slate-100/g, 'className="w-full sm:w-auto px-4 py-2.5 bg-slate-100');
content = content.replace(/className="px-4 py-2\.5 bg-rose-600/g, 'className="w-full sm:w-auto px-4 py-2.5 bg-rose-600');
fs.writeFileSync('src/pages/member/MemberProfile.jsx', content);
