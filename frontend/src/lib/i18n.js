'use client';
// Tiny translation layer. t('Students') returns the Somali word when Somali is chosen.
// If a word is missing it simply shows the English text, so nothing breaks.
// TO ADD A LANGUAGE: add a block below (e.g. ar: {...}) and a button in TopNav.
import { createContext, useContext, useEffect, useState } from 'react';

const dictionaries = {
  en: {},
  so: {
    Dashboard: 'Guddiga', Students: 'Ardayda', Teachers: 'Macallimiinta', Classes: 'Fasallada',
    Subjects: 'Maadooyinka', Attendance: 'Imaanshaha', Results: 'Natiijooyinka', Users: 'Isticmaalayaasha',
    'Sign in': 'Gal', 'Sign out': 'Ka bax', Email: 'Iimaylka', Password: 'Erayga sirta ah',
    Add: 'Ku dar', Edit: 'Wax ka beddel', Delete: 'Tirtir', Save: 'Kaydi', Cancel: 'Ka noqo', Search: 'Raadi',
    Print: 'Daabac', Loading: 'Waa la soo rarayaa…', 'Nothing here yet.': 'Wax xog ah lama helin.',
    'Delete this record?': 'Ma tirtirtaa xogtan?',
    'Full name': 'Magaca oo dhan', 'Admission no.': 'Lambarka diiwaangelinta', Gender: 'Jinsiga', Male: 'Lab', Female: 'Dheddig',
    Class: 'Fasalka', Guardian: 'Waalidka', 'Guardian phone': 'Taleefanka waalidka', Status: 'Xaalad',
    Active: 'Firfircoon', Inactive: 'Aan firfircoonayn', Graduated: 'Dhammeeyay',
    Name: 'Magaca', Phone: 'Taleefan', Subject: 'Maaddada', Section: 'Qaybta', 'Academic year': 'Sannad-dugsiyeedka',
    Teacher: 'Macallinka', Code: 'Koodh', Student: 'Arday', Score: 'Dhibcaha', Grade: 'Darajada',
    'Exam type': 'Nooca imtixaanka', Term: 'Xilliga', Year: 'Sannadka', Role: 'Doorka', Date: 'Taariikhda',
    Present: 'Jooga', Absent: 'Maqan', Late: 'Daahay', Excused: 'Cudurdaar',
    'Mark all present': 'Dhammaan jooga', 'Save attendance': 'Kaydi imaanshaha', 'Choose a class': 'Dooro fasal',
    'Good morning': 'Subax wanaagsan', 'Good afternoon': 'Galab wanaagsan', 'Good evening': 'Fiidnimo wanaagsan',
    'Attendance today': 'Imaanshaha maanta', 'Recent results': 'Natiijooyinkii ugu dambeeyay', 'Quick actions': 'Tallaabooyin degdeg ah',
    'Take attendance': 'Qaado imaanshaha', 'Enter results': 'Gali natiijooyin', 'Add a student': 'Ku dar arday',
    'My results': 'Natiijooyinkayga', 'My attendance': 'Imaanshahayga',
    Midterm: 'Dhexe', Final: 'Final', Quiz: 'Su\'aal-gaaban', Assignment: 'Hawlgal',
    'Term 1': 'Xilliga 1', 'Term 2': 'Xilliga 2', 'Term 3': 'Xilliga 3',
    admin: 'Maamule', teacher: 'Macallin', student: 'Arday', parent: 'Waalid',
    'Linked student': 'Ardayga la xiriiray',
  },
};

const LangContext = createContext({ lang: 'en', setLang: () => {}, t: (k) => k });
export const useT = () => useContext(LangContext);

export function LangProvider({ children }) {
  const [lang, setLangState] = useState('en');

  useEffect(() => {
    const saved = localStorage.getItem('lang');
    if (saved && dictionaries[saved]) setLangState(saved);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'; // ready for Arabic
  }, [lang]);

  const setLang = (l) => { setLangState(l); localStorage.setItem('lang', l); };
  const t = (key) => dictionaries[lang]?.[key] ?? key;

  return <LangContext.Provider value={{ lang, setLang, t }}>{children}</LangContext.Provider>;
}
