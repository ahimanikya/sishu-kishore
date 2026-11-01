// Birthday acknowledgements are author metadata, never literary contributions.
const profile=value=>typeof value==='string'&&/^\/writers\/[a-zA-Z0-9][a-zA-Z0-9_-]*\.html$/.test(value);
export function validateBirthday(value){
 if(value===null)return null;
 if(!value||typeof value!=='object'||Array.isArray(value))throw Error('Invalid birthday record.');
 const {day,month,source,approved}=value,year=value.year??null;
 if(!Number.isInteger(day)||!Number.isInteger(month)||month<1||month>12||year!==null&&(!Number.isInteger(year)||year<1000||year>9999))throw Error('Enter a valid birthday day, month and optional year.');
 const leap=year===null||year%4===0&&(year%100!==0||year%400===0),days=[31,leap?29:28,31,30,31,30,31,31,30,31,30,31];
 if(day<1||day>days[month-1])throw Error('That day does not exist in the selected month.');
 if(typeof source!=='string'||!source.trim()||source.length>2000)throw Error('Record the source used to verify this birthday.');
 if(typeof approved!=='boolean')throw Error('Record whether this birthday is approved for acknowledgement.');
 return {day,month,year,source:source.trim(),approved};
}
export function mergeAuthorBirthdays(authors,overrides=[]){
 if(!Array.isArray(authors)||!Array.isArray(overrides))throw Error('Invalid author birthday list.');
 const seen=new Set(),result=authors.map(author=>{
  if(!author||!profile(author.path)||typeof author.name!=='string'||!author.name.trim()||seen.has(author.path))throw Error('Invalid or duplicate author identity.');
  seen.add(author.path);return {...author,birthday:validateBirthday(author.birthday??null)};
 });
 const index=new Map(result.map(author=>[author.path,author])),overridden=new Set();
 for(const override of overrides){
  if(!override||!profile(override.profile)||overridden.has(override.profile)||!index.has(override.profile))throw Error('Birthday changes must identify one existing canonical author.');
  if(!Number.isInteger(override.revision)||override.revision<1)throw Error('Invalid author birthday revision.');
  overridden.add(override.profile);const author=index.get(override.profile);author.birthday=validateBirthday(override.birthday);author.birthdayRevision=override.revision;
 }
 return result;
}
export function birthdaysForIssue(authors,issue){
 if(typeof issue!=='string'||!/^\d{4}-(0[1-9]|1[0-2])$/.test(issue)||Number(issue.slice(0,4))<1)throw Error('Choose the edition month to include author birthdays.');
 const month=Number(issue.slice(5));
 return mergeAuthorBirthdays(authors).filter(a=>a.birthday?.approved&&a.birthday.month===month).sort((a,b)=>a.birthday.day-b.birthday.day||a.name.localeCompare(b.name,'or')||a.path.localeCompare(b.path)).map(({path,name,birthday})=>({path,name,birthday}));
}
