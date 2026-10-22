const pageInfo = {
  'admin-dashboard': ['Dashboard Kas','Monitoring pembayaran kas kelas R3S'],
  'admin-absensi': ['Dashboard Kas','Monitoring pembayaran kas kelas R3S'],
  'admin-cuti': ['Pengajuan Cuti','Verifikasi Pengajuan Cuti'],
  'admin-mahasiswa': ['Daftar Mahasiswa Admin','Kelola data mahasiswa kelas R3S'],
  dashboard: ['DASHBOARD','Ringkasan aktivitas mahasiswa'],
  absensi: ['ABSENSI','Pencatatan Kehadiran Mahasiswa'],
  kas: ['KAS','Status pembayaran Kas Anda'],
  cuti: ['CUTI','Pengajuan Cuti Mahasiswa'],
  laporan: ['LAPORAN','Ringkasan laporan mahasiswa'],
  informasi: ['INFORMASI','Dapatkan informasi yang Anda butuhkan'],
  profil: ['PROFIL','Informasi akun mahasiswa'],
  'daftar-login': ['DAFTAR LOGIN','Riwayat akun yang masuk ke portal'],
  keluar: ['KELUAR','Keluar dari portal mahasiswa']
};
const navButtons = document.querySelectorAll('.nav-item');
const pages = document.querySelectorAll('.page');
const title = document.getElementById('page-title');
const subtitle = document.getElementById('page-subtitle');
const toast = document.getElementById('toast');
let toastTimer;
function notify(message){
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=>toast.classList.remove('show'),2600);
}
function showPage(name){
  if(!pageInfo[name]) return;
  pages.forEach(page=>page.classList.toggle('active-page',page.dataset.view===name));
  navButtons.forEach(button=>button.classList.toggle('active',button.dataset.page===name));
  title.textContent=pageInfo[name][0];
  subtitle.textContent=pageInfo[name][1];
}
navButtons.forEach(button=>button.addEventListener('click',()=>showPage(button.dataset.page)));
document.querySelectorAll('[data-page-link]').forEach(link=>link.addEventListener('click',event=>{event.preventDefault();showPage(link.dataset.pageLink)}));
document.getElementById('attendance-filter').addEventListener('change',event=>{
  const filter=event.target.value;
  let visible=0;
  document.querySelectorAll('#attendance-rows tr').forEach(row=>{
    const show=filter==='all'||row.dataset.status===filter;
    row.hidden=!show;
    if(show)visible++;
  });
  document.getElementById('attendance-count').textContent=`${visible} data ditampilkan`;
});
document.getElementById('select-all').addEventListener('change',event=>{
  document.querySelectorAll('#attendance-rows input[type="checkbox"]').forEach(box=>box.checked=event.target.checked);
});
document.getElementById('add-attendance').addEventListener('click',()=>{
  const date=document.getElementById('attendance-date').value;
  if(!date){notify('Pilih tanggal absensi terlebih dahulu.');document.getElementById('attendance-date').focus();return;}
  const tbody=document.getElementById('attendance-rows');
  const row=document.createElement('tr');
  row.dataset.status='Hadir';
  const readable=new Date(`${date}T00:00:00`).toLocaleDateString('id-ID',{day:'2-digit',month:'long',year:'numeric'});
  row.innerHTML=`<td>▪</td><td>Absensi Kelas</td><td>${readable}</td><td><span class="status present">Hadir</span></td><td><button class="more-btn" aria-label="Hapus baris">•••</button></td>`;
  tbody.prepend(row);
  row.querySelector('.more-btn').addEventListener('click',()=>{row.remove();updateCount();});
  updateCount();notify('Data absensi berhasil ditambahkan.');
});
function updateCount(){document.getElementById('attendance-count').textContent=`${[...document.querySelectorAll('#attendance-rows tr')].filter(row=>!row.hidden).length} data ditampilkan`;}
document.querySelectorAll('[data-tab]').forEach(button=>button.addEventListener('click',()=>{
  document.querySelectorAll('[data-tab]').forEach(item=>item.classList.toggle('active',item===button));
  document.getElementById('biaya-tab').classList.toggle('hidden',button.dataset.tab!=='biaya');
  document.getElementById('transaksi-tab').classList.toggle('hidden',button.dataset.tab!=='transaksi');
  document.getElementById('payment-form').classList.add('hidden');
}));
document.querySelector('[data-open-payment]').addEventListener('click',()=>{
  document.getElementById('payment-form').classList.remove('hidden');
  document.getElementById('payment-message').textContent='';
  document.getElementById('payment-form').scrollIntoView({behavior:'smooth',block:'nearest'});
});
document.getElementById('continue-payment').addEventListener('click',()=>{
  const method=document.querySelector('input[name="pay"]:checked').value;
  document.getElementById('payment-message').textContent=method==='QRIS'?'QRIS dipilih. Silakan unggah bukti pembayaran pada tahap berikutnya.':'Transfer dipilih. Silakan kirim bukti transfer pada tahap berikutnya.';
  notify(`Metode pembayaran ${method} dipilih.`);
});
document.getElementById('leave-form').addEventListener('submit',event=>{
  event.preventDefault();document.getElementById('leave-message').textContent='Pengajuan cuti berhasil disimpan (contoh tampilan).';notify('Pengajuan cuti berhasil dikirim.');
});
document.getElementById('profile-form').addEventListener('submit',event=>{
  event.preventDefault();const current=(()=>{try{return JSON.parse(localStorage.getItem('r3s_current_user')||'{}')}catch(e){return {}}})();
  const name=document.getElementById('profile-name').value.trim(),user=document.getElementById('profile-user').value.trim(),email=document.getElementById('profile-email').value.trim(),klass=document.getElementById('profile-class').value.trim(),pass=document.getElementById('profile-password').value,confirmPass=document.getElementById('profile-password-confirm').value;
  const msg=document.getElementById('profile-message');if(!name||!user){msg.textContent='Nama dan username wajib diisi.';return;}if(pass&&pass.length<8){msg.textContent='Password minimal 8 karakter.';return;}if(pass!==confirmPass){msg.textContent='Konfirmasi password tidak sama.';return;}
  const accounts=getAccounts(),idx=accounts.findIndex(a=>String(a.user).toLowerCase()===String(current.user||'admin').toLowerCase());if(accounts.some((a,i)=>i!==idx&&String(a.user).toLowerCase()===user.toLowerCase())){msg.textContent='Username sudah digunakan akun lain.';return;}
  if(idx>=0){accounts[idx].name=name;accounts[idx].user=user;if(pass)accounts[idx].pass=pass;accounts[idx].email=email;accounts[idx].className=klass;localStorage.setItem('r3s_accounts',JSON.stringify(accounts));}
  const updated={...current,name,user,role:current.role||'admin'};localStorage.setItem('r3s_current_user',JSON.stringify(updated));localStorage.setItem('r3s_profile_settings',JSON.stringify({email,className:klass}));
  document.querySelector('.brand-copy strong')?.replaceChildren(document.createTextNode(name));document.getElementById('profile-display-name').textContent=name;document.getElementById('profile-password').value='';document.getElementById('profile-password-confirm').value='';msg.textContent='Pengaturan profil berhasil disimpan pada browser ini.';renderAdminPanel();notify('Profil berhasil diperbarui.');
});
document.getElementById('profile-photo-input')?.addEventListener('change',event=>{const file=event.target.files?.[0];if(!file)return;if(!file.type.startsWith('image/')){notify('Pilih file gambar.');return;}if(file.size>2*1024*1024){notify('Ukuran foto maksimal 2 MB.');return;}const reader=new FileReader();reader.onload=()=>{try{localStorage.setItem('r3s_admin_avatar',reader.result);document.getElementById('profile-avatar').src=reader.result;document.querySelector('.brand-mark').innerHTML='<img class="brand-avatar-small" src="'+reader.result+'" alt="">';notify('Foto profil diperbarui.');}catch(e){notify('Foto terlalu besar untuk penyimpanan browser.');}};reader.readAsDataURL(file);});
document.getElementById('profile-photo-reset')?.addEventListener('click',()=>{localStorage.removeItem('r3s_admin_avatar');document.getElementById('profile-avatar').src='r3s-art.jpg';document.querySelector('.brand-mark').innerHTML='R<span>3</span>S';notify('Logo R3S dipulihkan.');});
document.getElementById('settings-save')?.addEventListener('click',()=>{localStorage.setItem('r3s_compact_view',document.getElementById('setting-compact').checked?'1':'0');document.body.classList.toggle('compact-view',document.getElementById('setting-compact').checked);notify('Pengaturan tampilan disimpan.');});
document.querySelectorAll('[data-info]').forEach(button=>button.addEventListener('click',()=>{
  document.querySelectorAll('[data-info]').forEach(item=>item.classList.toggle('active',item===button));
  const heading=document.getElementById('info-heading');
  heading.textContent=button.textContent;
  const details=document.querySelectorAll('.info-panel details');
  details.forEach((item,index)=>{item.open=index===0;});
  if(button.dataset.info==='laporan-info') details[0].querySelector('summary').textContent='Kirim Laporan';
  else if(button.dataset.info==='pemberitahuan') details[0].querySelector('summary').textContent='Pemberitahuan Terbaru';
  else details[0].querySelector('summary').textContent='FAQ';
}));
document.getElementById('export-report').addEventListener('click',()=>{
  const csv='Kategori,Jumlah\\nTotal Pertemuan,15\\nHadir,13\\nIzin atau Sakit,2';
  const blob=new Blob([csv],{type:'text/csv;charset=utf-8;'});
  const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='laporan-absensi.csv';a.click();URL.revokeObjectURL(url);notify('Laporan CSV diunduh.');
});
document.getElementById('logout-confirm').addEventListener('click',()=>notify('Ini hanya demo UI. Hubungkan autentikasi untuk keluar sungguhan.'));
document.querySelectorAll('.more-btn').forEach(button=>button.addEventListener('click',()=>notify('Detail absensi dipilih.')));
function updateClock(){
  const now=new Date();
  const pad=value=>String(value).padStart(2,'0');
  document.getElementById('clock').textContent=`${pad(now.getHours())} : ${pad(now.getMinutes())} : ${pad(now.getSeconds())}`;
}
updateClock();setInterval(updateClock,1000);
document.getElementById('attendance-date').value=new Date().toISOString().slice(0,10);



function getAccounts(){try{return JSON.parse(localStorage.getItem('r3s_accounts')||'[]')}catch(e){return []}}
function getHistory(){try{return JSON.parse(localStorage.getItem('r3s_login_history')||'[]')}catch(e){return []}}
function downloadCSV(filename, rows){const csv=rows.map(row=>row.map(v=>'"'+String(v??'').replace(/"/g,'""')+'"').join(',')).join('\n');const blob=new Blob(['\ufeff'+csv],{type:'text/csv;charset=utf-8;'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=filename;a.click();setTimeout(()=>URL.revokeObjectURL(url),500);}
function renderAdminPanel(){
  const accountRows=document.getElementById('admin-account-rows'); if(!accountRows)return;
  const accounts=getAccounts(), history=getHistory();
  document.getElementById('admin-total-accounts').textContent=accounts.length;
  document.getElementById('admin-total-students').textContent=accounts.filter(a=>(a.role||((a.user||'').toLowerCase()==='admin'?'admin':'mahasiswa'))==='mahasiswa').length;
  document.getElementById('admin-total-logins').textContent=history.length;
  const search=(document.getElementById('admin-search')?.value||'').toLowerCase();
  const roleFilter=document.getElementById('admin-role-filter')?.value||'all';
  const filtered=accounts.map((a,i)=>({...a,_idx:i})).filter(a=>`${a.name||''} ${a.user||''}`.toLowerCase().includes(search)&&(roleFilter==='all'||(a.role||'mahasiswa')===roleFilter));
  accountRows.innerHTML=filtered.map(a=>{const role=a.role||((a.user||'').toLowerCase()==='admin'?'admin':'mahasiswa');const active=a.active!==false;const protectedAccount=(a.user||'').toLowerCase()==='admin';return `<tr><td>${escapeAdminText(a.name||'-')}</td><td>${escapeAdminText(a.user||'-')}</td><td>${role==='admin'?'Admin':'Mahasiswa'}</td><td><span class="status ${active?'present':'pending'}">${active?'Aktif':'Nonaktif'}</span></td><td><div class="row-actions"><button class="more-btn" data-edit-account="${a._idx}">Edit</button>${protectedAccount?'<span class="muted">Akun utama</span>':`<button class="more-btn" data-toggle-account="${a._idx}">${active?'Nonaktifkan':'Aktifkan'}</button><button class="more-btn danger-action" data-delete-account="${a._idx}">Hapus</button>`}</div></td></tr>`}).join('')||'<tr><td colspan="5">Tidak ada akun yang cocok.</td></tr>';
  const loginRows=document.getElementById('admin-login-rows');
  loginRows.innerHTML=history.slice().reverse().slice(0,10).map(h=>`<tr><td>${escapeAdminText(h.name||'-')}</td><td>${escapeAdminText(h.user||'-')}</td><td>${escapeAdminText(h.time||'-')}</td><td>${escapeAdminText(h.status||'Berhasil')}</td></tr>`).join('')||'<tr><td colspan="4">Belum ada riwayat login.</td></tr>';
  accountRows.querySelectorAll('[data-delete-account]').forEach(btn=>btn.addEventListener('click',()=>{const idx=Number(btn.dataset.deleteAccount),current=getAccounts();if(!current[idx]||(current[idx].user||'').toLowerCase()==='admin')return;if(confirm('Hapus akun '+current[idx].user+'? Tindakan ini tidak dapat dibatalkan.')){current.splice(idx,1);localStorage.setItem('r3s_accounts',JSON.stringify(current));renderAdminPanel();notify('Akun berhasil dihapus.');}}));
  accountRows.querySelectorAll('[data-toggle-account]').forEach(btn=>btn.addEventListener('click',()=>{const idx=Number(btn.dataset.toggleAccount),current=getAccounts();if(!current[idx])return;current[idx].active=current[idx].active===false;localStorage.setItem('r3s_accounts',JSON.stringify(current));renderAdminPanel();notify('Status akun diperbarui.');}));
  accountRows.querySelectorAll('[data-edit-account]').forEach(btn=>btn.addEventListener('click',()=>{const idx=Number(btn.dataset.editAccount),current=getAccounts(),a=current[idx];if(!a)return;const name=prompt('Ubah nama lengkap:',a.name||'');if(name===null)return;const user=prompt('Ubah username / NIM:',a.user||'');if(user===null)return;if(!name.trim()||!user.trim()){alert('Nama dan username wajib diisi.');return;}if(current.some((x,i)=>i!==idx&&String(x.user).toLowerCase()===user.trim().toLowerCase())){alert('Username sudah digunakan.');return;}const role=prompt('Peran akun: ketik admin atau mahasiswa',a.role||'mahasiswa');if(role===null)return;if(!['admin','mahasiswa'].includes(role.trim().toLowerCase())){alert('Peran harus admin atau mahasiswa.');return;}a.name=name.trim();a.user=user.trim();a.role=role.trim().toLowerCase();const pass=prompt('Password baru (kosongkan jika tidak diubah):','');if(pass===null)return;if(pass){if(pass.length<8){alert('Password minimal 8 karakter.');return;}a.pass=pass;}current[idx]=a;localStorage.setItem('r3s_accounts',JSON.stringify(current));renderAdminPanel();notify('Akun berhasil diperbarui.');}));
}
function readStore(key){try{return JSON.parse(localStorage.getItem(key)||'[]')}catch(e){return []}}
function writeStore(key,value){localStorage.setItem(key,JSON.stringify(value))}
function renderManagerStudents(){
 const opts=getAccounts().filter(a=>(a.role||((a.user||'').toLowerCase()==='admin'?'admin':'mahasiswa'))==='mahasiswa').map(a=>`<option value="${escapeAdminText(a.user)}">${escapeAdminText(a.name||a.user)} (${escapeAdminText(a.user)})</option>`).join('');
 ['manager-att-student','manager-cash-student'].forEach(id=>{const el=document.getElementById(id);if(el){const old=el.value;el.innerHTML=opts||'<option value="">Belum ada akun mahasiswa</option>';if([...el.options].some(o=>o.value===old))el.value=old;}});
}
function renderManagedAttendance(){
 const rows=document.getElementById('manager-attendance-rows');if(!rows)return;
 const data=readStore('r3s_managed_attendance');
 rows.innerHTML=data.slice().reverse().map((r,i)=>`<tr><td>${escapeAdminText(r.name||r.user)}</td><td>${escapeAdminText(r.date)}</td><td>${escapeAdminText(r.course)}</td><td><span class="status ${r.status==='Hadir'?'present':r.status==='Sakit'?'sick':r.status==='Izin'?'leave':'pending'}">${escapeAdminText(r.status)}</span></td><td><button class="more-btn danger-action" data-remove-att="${data.length-1-i}">Hapus</button></td></tr>`).join('')||'<tr><td colspan="5">Belum ada data kehadiran yang dikelola admin.</td></tr>';
 rows.querySelectorAll('[data-remove-att]').forEach(b=>b.addEventListener('click',()=>{if(confirm('Hapus catatan kehadiran ini?')){const d=readStore('r3s_managed_attendance');d.splice(Number(b.dataset.removeAtt),1);writeStore('r3s_managed_attendance',d);renderManagedAttendance();notify('Catatan kehadiran dihapus.');}}));
}
function renderManagedCash(){
 const rows=document.getElementById('manager-cash-rows');if(!rows)return;
 const data=readStore('r3s_managed_cash');
 rows.innerHTML=data.slice().reverse().map((r,i)=>`<tr><td>${escapeAdminText(r.name||r.user)}</td><td>${escapeAdminText(r.period)}</td><td>Rp ${Number(r.amount||0).toLocaleString('id-ID')}</td><td><span class="status ${r.status==='Lunas'?'present':'pending'}">${escapeAdminText(r.status)}</span></td><td><div class="row-actions"><button class="more-btn" data-toggle-cash="${data.length-1-i}">${r.status==='Lunas'?'Tandai belum lunas':'Tandai lunas'}</button><button class="more-btn danger-action" data-remove-cash="${data.length-1-i}">Hapus</button></div></td></tr>`).join('')||'<tr><td colspan="5">Belum ada data pembayaran kas.</td></tr>';
 rows.querySelectorAll('[data-toggle-cash]').forEach(b=>b.addEventListener('click',()=>{const d=readStore('r3s_managed_cash'),r=d[Number(b.dataset.toggleCash)];if(!r)return;r.status=r.status==='Lunas'?'Belum Lunas':'Lunas';writeStore('r3s_managed_cash',d);renderManagedCash();notify('Status pembayaran diperbarui.');}));
 rows.querySelectorAll('[data-remove-cash]').forEach(b=>b.addEventListener('click',()=>{if(confirm('Hapus catatan kas ini?')){const d=readStore('r3s_managed_cash');d.splice(Number(b.dataset.removeCash),1);writeStore('r3s_managed_cash',d);renderManagedCash();notify('Catatan kas dihapus.');}}));
}
document.getElementById('admin-attendance-form')?.addEventListener('submit',e=>{e.preventDefault();const user=document.getElementById('manager-att-student').value,account=getAccounts().find(a=>a.user===user);if(!account){notify('Pilih akun mahasiswa terlebih dahulu.');return;}const d=readStore('r3s_managed_attendance');d.push({user,name:account.name||user,date:document.getElementById('manager-att-date').value,course:document.getElementById('manager-att-course').value.trim(),status:document.getElementById('manager-att-status').value,createdAt:new Date().toISOString()});writeStore('r3s_managed_attendance',d);renderManagedAttendance();e.target.reset();document.getElementById('manager-att-date').value=new Date().toISOString().slice(0,10);notify('Data kehadiran berhasil disimpan.');});
document.getElementById('admin-cash-form')?.addEventListener('submit',e=>{e.preventDefault();const user=document.getElementById('manager-cash-student').value,account=getAccounts().find(a=>a.user===user);if(!account){notify('Pilih akun mahasiswa terlebih dahulu.');return;}const d=readStore('r3s_managed_cash');d.push({user,name:account.name||user,period:document.getElementById('manager-cash-period').value.trim(),amount:Number(document.getElementById('manager-cash-amount').value),status:document.getElementById('manager-cash-status').value,createdAt:new Date().toISOString()});writeStore('r3s_managed_cash',d);renderManagedCash();e.target.reset();document.getElementById('manager-cash-amount').value=15000;notify('Data kas berhasil disimpan.');});
document.getElementById('admin-export-attendance')?.addEventListener('click',()=>{const d=readStore('r3s_managed_attendance');downloadCSV('kehadiran-r3s.csv',[['Nama','Username/NIM','Tanggal','Kegiatan','Status'],...d.map(r=>[r.name,r.user,r.date,r.course,r.status])]);});
document.getElementById('admin-export-cash')?.addEventListener('click',()=>{const d=readStore('r3s_managed_cash');downloadCSV('kas-r3s.csv',[['Nama','Username/NIM','Periode','Nominal','Status'],...d.map(r=>[r.name,r.user,r.period,r.amount,r.status])]);});
function initAdminManagers(){renderManagerStudents();renderManagedAttendance();renderManagedCash();const date=document.getElementById('manager-att-date');if(date&&!date.value)date.value=new Date().toISOString().slice(0,10);}
function escapeAdminText(value){return String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
document.getElementById('admin-refresh')?.addEventListener('click',()=>{renderAdminPanel();initAdminManagers();notify('Data admin diperbarui.');});
document.getElementById('admin-search')?.addEventListener('input',renderAdminPanel);
document.getElementById('admin-role-filter')?.addEventListener('change',renderAdminPanel);
document.getElementById('admin-add-account')?.addEventListener('click',()=>{const name=prompt('Nama lengkap akun baru:');if(!name)return;const user=prompt('Username / NIM:');if(!user)return;const pass=prompt('Password (minimal 8 karakter):');if(!pass)return;if(pass.length<8){alert('Password minimal 8 karakter.');return;}const list=getAccounts();if(list.some(a=>String(a.user).toLowerCase()===user.trim().toLowerCase())){alert('Username sudah digunakan.');return;}list.push({name:name.trim(),user:user.trim(),pass,role:'mahasiswa',active:true});localStorage.setItem('r3s_accounts',JSON.stringify(list));renderAdminPanel();notify('Akun mahasiswa berhasil ditambahkan.');});
document.getElementById('admin-export-accounts')?.addEventListener('click',()=>{downloadCSV('akun-r3s.csv',[['Nama','Username/NIM','Peran','Status'],...getAccounts().map(a=>[a.name,a.user,a.role||'mahasiswa',a.active===false?'Nonaktif':'Aktif'])]);notify('Data akun diekspor.');});
document.getElementById('admin-clear-logins')?.addEventListener('click',()=>{if(confirm('Hapus seluruh riwayat login dari browser ini?')){localStorage.setItem('r3s_login_history','[]');renderAdminPanel();renderLoginHistory();notify('Riwayat login dihapus.');}});

function renderLoginHistory(){
  const rows=document.getElementById('login-history-rows');
  const count=document.getElementById('login-history-count');
  if(!rows)return;
  let history=[];
  try{history=JSON.parse(localStorage.getItem('r3s_login_history')||'[]')}catch(e){history=[]}
  if(!history.length){rows.innerHTML='<tr><td colspan="4" style="text-align:center;color:#9fc4ee">Belum ada riwayat login.</td></tr>'}
  else rows.innerHTML=history.slice().reverse().map(item=>`<tr><td>${item.name||'-'}</td><td>${item.user||'-'}</td><td>${item.time||'-'}</td><td><span class="status present">${item.status||'Berhasil'}</span></td></tr>`).join('');
  if(count)count.textContent=`${history.length} login`;
}
renderLoginHistory();

// Added authentication interactions. Accounts are stored locally in the browser.
(function(){
  const auth = document.getElementById('auth-screen');
  const app = document.getElementById('app-shell');
  if (!auth || !app) return;

  const accountsKey = 'r3s_accounts';
  const sessionKey = 'r3s_logged_in';

  // Akun demo otomatis tersedia agar halaman bisa langsung dicoba.
  const demoAccounts = [
    {name:'Admin R3S', user:'admin', pass:'admin123', role:'admin'},
    {name:'Mahasiswa R3S', user:'mahasiswa', pass:'12345678', role:'mahasiswa'}
  ];

  function accounts(){
    let list = [];
    try {
      const saved = JSON.parse(localStorage.getItem(accountsKey) || '[]');
      if (Array.isArray(saved)) list = saved;
    } catch(e) {}
    // Pastikan akun admin dan mahasiswa selalu tersedia.
    demoAccounts.forEach(demo => {
      const exists = demo.role === 'admin' ? list.some(a => (a.role || (String(a.user).toLowerCase()==='admin'?'admin':'mahasiswa')) === 'admin') : list.some(a => String(a.user).toLowerCase() === demo.user);
      if (!exists) list.push(demo);
    });
    list = list.map(a => ({
      ...a,
      role: a.role || (String(a.user).toLowerCase() === 'admin' ? 'admin' : 'mahasiswa')
    }));
    localStorage.setItem(accountsKey, JSON.stringify(list));
    return list;
  }
  function saveAccounts(list){ localStorage.setItem(accountsKey, JSON.stringify(list)); }

  function showAuth(view){
    document.querySelectorAll('.auth-view').forEach(v => v.classList.toggle('active', v.dataset.authView === view));
    document.querySelectorAll('.auth-message').forEach(m => m.textContent = '');
  }
  document.querySelectorAll('[data-auth-target]').forEach(btn => {
    btn.addEventListener('click', () => showAuth(btn.dataset.authTarget));
  });
  document.querySelectorAll('[data-toggle-password]').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = document.getElementById(btn.dataset.togglePassword);
      if (!input) return;
      input.type = input.type === 'password' ? 'text' : 'password';
    });
  });

  document.getElementById('register-form')?.addEventListener('submit', e => {
    e.preventDefault();
    const name = document.getElementById('register-name').value.trim();
    const user = document.getElementById('register-user').value.trim();
    const pass = document.getElementById('register-password').value;
    const confirm = document.getElementById('register-confirm').value;
    const msg = document.getElementById('register-message');
    if (pass !== confirm) { msg.textContent = 'Konfirmasi password tidak sama.'; return; }
    const list = accounts();
    if (list.some(a => a.user.toLowerCase() === user.toLowerCase())) { msg.textContent = 'Username/NIM sudah terdaftar.'; return; }
    list.push({name, user, pass, role:'mahasiswa'});
    saveAccounts(list);
    msg.textContent = 'Pendaftaran berhasil. Silakan masuk.';
    setTimeout(() => {
      showAuth('login');
      document.getElementById('login-user').value = user;
    }, 600);
  });

  document.getElementById('login-form')?.addEventListener('submit', e => {
    e.preventDefault();
    const user = document.getElementById('login-user').value.trim();
    const pass = document.getElementById('login-password').value;
    const msg = document.getElementById('login-message');
    const found = accounts().find(a => a.user.toLowerCase() === user.toLowerCase() && a.pass === pass);
    if (!found) { msg.textContent = 'NIM/username atau password salah.'; return; }
    if(found.active===false){msg.textContent='Akun dinonaktifkan. Hubungi administrator.';return;}
    localStorage.setItem(sessionKey, '1');
      localStorage.setItem('r3s_current_user', JSON.stringify({
        name: found.name || found.user,
        user: found.user,
        role: found.role || (found.user.toLowerCase() === 'admin' ? 'admin' : 'mahasiswa')
      }));
    let history=[];
    try{history=JSON.parse(localStorage.getItem('r3s_login_history')||'[]')}catch(e){}
    history.push({name:found.name||found.user,user:found.user,time:new Date().toLocaleString('id-ID'),status:'Berhasil'});
    localStorage.setItem('r3s_login_history', JSON.stringify(history.slice(-50)));
    renderLoginHistory();
    auth.style.display = 'none';
    app.classList.add('auth-unlocked');
    document.querySelector('.brand-copy strong')?.replaceChildren(document.createTextNode(found.name));
    document.querySelector('.welcome-panel h2')?.replaceChildren(document.createTextNode(found.name));
    const role = found.role || (found.user.toLowerCase()==='admin'?'admin':'mahasiswa');
    const adminMode = role === 'admin';
    
    if (adminMode) {
      document.body.classList.add('admin-mode');
      document.querySelectorAll('.nav-menu .nav-item[data-page]').forEach(btn => btn.hidden = true);
      document.getElementById('admin-nav').hidden = false;
      document.getElementById('admin-absensi-nav').hidden = false;
      document.getElementById('admin-cuti-nav').hidden = false;
      document.getElementById('admin-mahasiswa-nav').hidden = false;
      document.querySelector('.nav-item.logout').hidden = false;

      showPage('admin-dashboard');
      document.getElementById('profile-name').value=found.name||'Admin R3S';
      document.getElementById('profile-user').value=found.user||'admin';
      const prefs=(()=>{try{return JSON.parse(localStorage.getItem('r3s_profile_settings')||'{}')}catch(e){return {}}})();
      document.getElementById('profile-email').value=found.email||prefs.email||'';
      document.getElementById('profile-class').value=found.className||prefs.className||'R3S';
      document.getElementById('profile-display-name').textContent=found.name||'Admin R3S';
      const avatar=localStorage.getItem('r3s_admin_avatar');
      if(avatar){
        document.getElementById('profile-avatar').src=avatar;
        document.querySelector('.brand-mark').innerHTML='<img class="brand-avatar-small" src="'+avatar+'" alt="">';
      }
    } else {
      document.body.classList.remove('admin-mode');
      document.querySelectorAll('.nav-menu .nav-item[data-page]').forEach(btn => btn.hidden = false);
      document.getElementById('admin-nav').hidden = true;
      document.getElementById('admin-absensi-nav').hidden = true;
      document.getElementById('admin-cuti-nav').hidden = true;
      document.getElementById('admin-mahasiswa-nav').hidden = true;
      document.querySelector('.nav-item.logout').hidden = false;

      showPage('absensi');
    }
    
    const subtitleEl=document.querySelector('.header-user span:last-child');
    if(subtitleEl)subtitleEl.textContent=adminMode?'Administrator':'Portal Mahasiswa';
  });

  document.getElementById('forgot-form')?.addEventListener('submit', e => {
    e.preventDefault();
    const user = document.getElementById('forgot-user').value.trim();
    const exists = accounts().some(a => a.user.toLowerCase() === user.toLowerCase());
    document.getElementById('forgot-message').textContent = exists
      ? 'Permintaan reset diterima. Silakan hubungi admin kelas untuk reset password.'
      : 'Akun tidak ditemukan.';
  });

  // Inisialisasi akun demo saat pertama kali membuka aplikasi.
  accounts();

  // Tampilkan halaman login saat aplikasi dibuka; sesi lama tidak boleh melewati login.
  localStorage.removeItem(sessionKey);
  localStorage.removeItem('r3s_current_user');
  auth.style.display = 'flex';
  app.classList.remove('auth-unlocked');
  showAuth('login');

  document.getElementById('logout-confirm')?.addEventListener('click', () => {
    localStorage.removeItem(sessionKey);
    localStorage.removeItem('r3s_current_user');
    app.classList.remove('auth-unlocked');
    document.body.classList.remove('admin-mode');
    auth.style.display = 'grid';
    showAuth('login');
  });
})();