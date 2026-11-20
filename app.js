const $ = (id) => document.getElementById(id);
const money = (n) => Number(n || 0).toLocaleString('th-TH',{minimumFractionDigits:2,maximumFractionDigits:2});
const cases = [
 {id:1,title:'ค่าเช่าสำนักงาน',payer:'company',recipient:'company',category:'rent',amount:30000,vat:0,desc:'บริษัทจ่ายค่าเช่าสำนักงานให้บริษัทในประเทศไทย มีสัญญาเช่า',expected:'แนวทาง 5% = 1,500 บาท',rate:5},
 {id:2,title:'ค่าเช่าอาคารแก่บุคคลธรรมดา',payer:'company',recipient:'individual',category:'rent',amount:12000,vat:0,desc:'บริษัทจ่ายค่าเช่าอาคารให้บุคคลธรรมดา',expected:'แนวทาง 5% = 600 บาท',rate:5},
 {id:3,title:'ค่าจ้างทำของ',payer:'company',recipient:'company',category:'hire',amount:15000,vat:1050,desc:'บริษัทว่าจ้างผู้รับเหมาให้ผลิต/ติดตั้งงานตามสัญญา',expected:'แนวทาง 3% ของฐานก่อน VAT = 450 บาท',rate:3},
 {id:4,title:'ค่าบริการทำความสะอาด',payer:'company',recipient:'company',category:'service',amount:20000,vat:1400,desc:'บริษัทจ่ายค่าบริการทำความสะอาด ไม่ใช่บริการโรงแรมหรือภัตตาคาร',expected:'แนวทาง 3% ของฐานก่อน VAT = 600 บาท',rate:3},
 {id:5,title:'ค่าโฆษณาออนไลน์',payer:'company',recipient:'company',category:'advertising',amount:25000,vat:1750,desc:'บริษัทจ่ายค่าโฆษณาให้ผู้ให้บริการโฆษณา',expected:'แนวทาง 2% ของฐานก่อน VAT = 500 บาท',rate:2},
 {id:6,title:'ค่าขนส่งสินค้า',payer:'company',recipient:'company',category:'transport',amount:18000,vat:0,desc:'บริษัทจ่ายค่ารับจ้างขนส่งสินค้า ไม่ใช่ค่าโดยสารขนส่งสาธารณะ',expected:'แนวทาง 1% = 180 บาท เมื่อเข้าเงื่อนไข',rate:1},
 {id:7,title:'ซื้อสินค้าพร้อมค่าจัดส่ง',payer:'company',recipient:'company',category:'goods',amount:42000,vat:2940,desc:'ซื้อสินค้าทั่วไปจากผู้ขายที่ประกอบธุรกิจขายสินค้า โดยค่าขนส่งเป็นส่วนหนึ่งของการขาย',expected:'โดยทั่วไปไม่หักจากการซื้อสินค้าทั่วไป แต่ต้องแยกข้อเท็จจริงค่าขนส่ง',rate:null},
 {id:8,title:'ค่าบริการโรงแรม',payer:'company',recipient:'company',category:'hotel',amount:8000,vat:560,desc:'บริษัทชำระค่าห้องพักโรงแรมตามใบแจ้งหนี้',expected:'ไม่ใช้ข้อ 12/1 สำหรับค่าบริการโรงแรม ต้องพิจารณาข้อเท็จจริงอื่น',rate:null},
 {id:9,title:'ค่านายหน้า',payer:'company',recipient:'company',category:'commission',amount:10000,vat:0,desc:'บริษัทจ่ายค่านายหน้าให้บริษัทในประเทศไทย',expected:'แนวทาง 3% ตามมาตรา 40(2) และข้อ 3/1 เมื่อเข้าเงื่อนไข',rate:3},
 {id:10,title:'ค่าดำเนินการไม่ชัดเจน',payer:'company',recipient:'unknown',category:'unclear',amount:10000,vat:0,desc:'เอกสารระบุเพียงค่าดำเนินการ ไม่ทราบว่าเป็นค่าบริการหรือค่าใช้จ่ายประเภทใด',expected:'หยุดและขอข้อมูลเพิ่มเติมก่อนคำนวณ',rate:null}
];
const categoryInfo = {
 rent:{rate:5,law:'ประมวลรัษฎากร มาตรา 40(5)(ก) และ ท.ป.4/2528 ข้อ 6',reason:'ค่าเช่าทรัพย์สิน โดยทั่วไปหัก 5% เมื่อผู้จ่ายและผู้รับเข้าเงื่อนไข'},
 hire:{rate:3,law:'ประมวลรัษฎากร มาตรา 40(7) หรือ 40(8) และ ท.ป.4/2528 ข้อ 8',reason:'ค่าจ้างทำของ โดยทั่วไปหัก 3% เมื่อเป็นการจ้างทำของและเข้าเงื่อนไข'},
 service:{rate:3,law:'ประมวลรัษฎากร มาตรา 40(8), ท.ป.4/2528 ข้อ 12/1 และ ท.ป.104/2544',reason:'บริการอื่นโดยทั่วไป 3% แต่ไม่รวมค่าบริการโรงแรม ภัตตาคาร และกรณีเฉพาะที่มีกฎต่างหาก'},
 advertising:{rate:2,law:'ท.ป.4/2528 ข้อ 10 และคำสั่ง ป.6/2528',reason:'ค่าโฆษณาโดยทั่วไปหัก 2% ตามข้อเท็จจริงและเงื่อนไข'},
 transport:{rate:1,law:'ท.ป.4/2528 ข้อ 12/4 ซึ่งแก้ไขโดย ท.ป.104/2544',reason:'ค่าขนส่งโดยทั่วไปหัก 1% ไม่รวมค่าโดยสารขนส่งสาธารณะ และต้องตรวจเกณฑ์สัญญา'},
 commission:{rate:3,law:'ประมวลรัษฎากร มาตรา 40(2) และ ท.ป.4/2528 ข้อ 3/1',reason:'ค่านายหน้าหรือค่าตอบแทนจากการรับทำงานให้ อาจเข้ามาตรา 40(2); อัตราขึ้นกับผู้รับและสถานะ'},
 professional:{rate:null,law:'ประมวลรัษฎากร มาตรา 40(6) และ ท.ป.4/2528 ข้อ 7',reason:'วิชาชีพอิสระต้องตรวจประเภทวิชาชีพและสถานะผู้รับก่อนกำหนดอัตรา'},
 goods:{rate:null,law:'ท.ป.4/2528 ข้อ 3 และบทบัญญัติ/คำสั่งเฉพาะเกี่ยวกับสินค้าบางชนิด',reason:'การซื้อสินค้าทั่วไปโดยปกติไม่ใช่บริการที่ต้องหัก แต่มีสินค้าหรือกิจการเฉพาะที่อาจต้องหัก'},
 hotel:{rate:null,law:'ท.ป.4/2528 ข้อ 12/1 (มีข้อยกเว้นค่าบริการโรงแรมและภัตตาคาร)',reason:'ไม่ควรนำอัตราบริการทั่วไป 3% มาใช้กับค่าบริการโรงแรม/ภัตตาคารโดยอัตโนมัติ'},
 unclear:{rate:null,law:'ยังระบุบทกฎหมายไม่ได้จากข้อมูลที่มี',reason:'ต้องขอใบแจ้งหนี้ สัญญา รายละเอียดงาน และสถานะผู้รับเงินเพิ่ม'}
};
function renderCases(){
 $('testCases').innerHTML = cases.map(c=>`<article class="case-card">
 <h3>${c.id}. ${c.title}</h3><p>${c.desc}</p>
 <div class="case-meta"><span class="tag">${c.amount.toLocaleString('th-TH')} บาท</span><span class="tag">${c.rate===null?'ต้องตรวจเงื่อนไข':c.rate+'%'}</span></div>
 <p><strong>ผลตัวอย่าง:</strong> ${c.expected}</p>
 <button class="case-button" data-case="${c.id}">ดูผลตัวอย่างในแบบคำนวณ</button>
 </article>`).join('');
 document.querySelectorAll('[data-case]').forEach(btn=>btn.addEventListener('click',()=>loadCase(Number(btn.dataset.case))));
}
function loadCase(id){
 const c=cases.find(x=>x.id===id);
 $('payerType').value=c.payer;$('recipientType').value=c.recipient;$('category').value=c.category;
 $('amount').value=c.amount;$('vat').value=c.vat;$('description').value=c.desc;
 $('contractOver1000').checked=c.amount>=1000;
 document.querySelector('[data-tab="calculator"]').click();
 $('taxForm').requestSubmit();
}
function analyze(e){
 e.preventDefault();
 const payer=$('payerType').value, recipient=$('recipientType').value, category=$('category').value;
 const amount=Number($('amount').value), vat=Number($('vat').value||0), date=$('paymentDate').value;
 const contract=$('contractOver1000').checked, desc=$('description').value.trim();
 const out=$('result');out.className='result';out.classList.remove('hidden');
 const stop=(title,reasons)=>{out.classList.add('stop');out.innerHTML=`<h3>⚠ ${title}</h3><ul>${reasons.map(x=>`<li>${x}</li>`).join('')}</ul><div class="reason">ระบบยังไม่คำนวณภาษี เพื่อป้องกันการใช้อัตราผิดกรณี กรุณาตรวจเอกสารและส่งต่อผู้เชี่ยวชาญ</div>`;};
 if(!date||!category||!amount||amount<0||vat<0){stop('ข้อมูลไม่ครบ',['กรุณาระบุวันที่ ประเภทธุรกรรม และจำนวนเงินก่อน VAT/VAT ให้ถูกต้อง']);return;}
 if(payer!=='company'){stop('ต้องตรวจสถานะผู้จ่ายเงิน',['ตัวอย่างอัตราในระบบนี้เน้นกรณีผู้จ่ายเป็นบริษัท/ห้างหุ้นส่วนนิติบุคคล/นิติบุคคลอื่น','ผู้จ่ายประเภทอื่นอาจอยู่ภายใต้บทกฎหมายและหน้าที่แตกต่างกัน']);return;}
 if(recipient==='unknown'||recipient==='foreign'||recipient==='foundation'){stop('ต้องตรวจสถานะผู้รับเงิน',['ผู้รับเป็นมูลนิธิ/สมาคมหรือผู้รับต่างประเทศอาจใช้อัตราและหลักเกณฑ์เฉพาะ','ต้องตรวจถิ่นที่อยู่ หนังสือรับรอง และอนุสัญญาภาษีซ้อน (ถ้ามี)']);return;}
 if(['unclear','professional','goods','hotel'].includes(category)){stop(categoryInfo[category].reason,[categoryInfo[category].reason,'ขอเอกสารสัญญา ใบแจ้งหนี้ และรายละเอียดการให้บริการ/ส่งมอบสินค้าเพิ่มเติม']);return;}
 if(category==='transport'&&!contract){stop('ยังยืนยันเกณฑ์สัญญาไม่ได้',['ค่าขนส่งตาม ท.ป.104/2544 ข้อ 12/5 ต้องตรวจจำนวนตามสัญญารายหนึ่งตั้งแต่ 1,000 บาทขึ้นไป แม้แบ่งจ่าย','กรุณายืนยันมูลค่าสัญญาและลักษณะว่าไม่ใช่ขนส่งสาธารณะ']);return;}
 const info=categoryInfo[category];
 if(!info||info.rate===null){stop('ต้องส่งตรวจเพิ่มเติม',['ยังไม่มีอัตราที่ระบบยืนยันได้สำหรับข้อมูลนี้']);return;}
 if(category==='service'&&/โรงแรม|ภัตตาคาร|ร้านอาหาร/.test(desc)){stop('อาจเป็นข้อยกเว้นของบริการทั่วไป',['บริการโรงแรมและภัตตาคารไม่อยู่ในข้อ 12/1 ตาม ท.ป.104/2544 ต้องพิจารณาข้อเท็จจริงและกฎหมายอื่น']);return;}
 const base=amount, tax=base*info.rate/100, net=base+vat-tax;
 const form=recipient==='individual'?'ภ.ง.ด.3':'ภ.ง.ด.53';
 out.classList.add('ok');
 out.innerHTML=`<h3>ผลวิเคราะห์เบื้องต้น</h3>
 <div class="big">${money(tax)} บาท</div><p>ภาษีหัก ณ ที่จ่ายโดยประมาณ (${info.rate}%)</p>
 <div class="result-grid">
 <div class="metric"><small>ฐานคำนวณก่อน VAT</small><strong>${money(base)} บาท</strong></div>
 <div class="metric"><small>VAT</small><strong>${money(vat)} บาท</strong></div>
 <div class="metric"><small>ยอดจ่ายสุทธิ</small><strong>${money(net)} บาท</strong></div></div>
 <p><strong>ประเภทเงินได้:</strong> ${categoryLabel(category)}</p>
 <p><strong>เหตุผล:</strong> ${info.reason}</p><p><strong>กฎหมายที่เกี่ยวข้อง:</strong> ${info.law}</p>
 <p><strong>แบบนำส่งเบื้องต้น:</strong> ${form} (ตรวจสอบประเภทผู้รับและแบบที่ถูกต้องอีกครั้ง)</p>
 <div class="reason"><strong>ข้อจำกัด:</strong> ${desc?escapeHtml(desc):'ไม่ได้ระบุรายละเอียดเพิ่มเติม'}<br>ผลนี้เป็นการคำนวณตามสมมติฐานว่าฐานก่อน VAT เป็นฐานเงินได้ที่ต้องหัก และไม่มีข้อยกเว้น/เงื่อนไขพิเศษ ต้องตรวจสัญญาและเอกสารจริงก่อนใช้งาน</div>`;
}
function categoryLabel(k){return ({rent:'ค่าเช่าทรัพย์สิน',hire:'ค่าจ้างทำของ',service:'ค่าบริการทั่วไป',advertising:'ค่าโฆษณา',transport:'ค่าขนส่งสินค้า',commission:'ค่านายหน้า/ค่าธรรมเนียม'})[k]||k;}
function escapeHtml(s){return s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
document.querySelectorAll('.tab').forEach(btn=>btn.addEventListener('click',()=>{
 document.querySelectorAll('.tab,.panel').forEach(x=>x.classList.remove('active'));
 btn.classList.add('active');$(btn.dataset.tab).classList.add('active');
}));
$('taxForm').addEventListener('submit',analyze);
$('resetBtn').addEventListener('click',()=>{setTimeout(()=>{$('result').classList.add('hidden');},0);});
renderCases();