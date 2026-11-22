import React, { useEffect, useMemo, useState } from 'react'
import * as Icon from 'lucide-react'
import { audiences, scripts, objections, faqs, journey, benefits, programSource } from './data'

const MENU = [
  {id:'dashboard',title:'Обзор',icon:'LayoutDashboard'},
  {id:'picker',title:'Быстрый подбор скрипта',icon:'WandSparkles'},
  {id:'audiences',title:'Категории клиентов',icon:'UsersRound'},
  {id:'scripts',title:'Библиотека скриптов',icon:'MessagesSquare'},
  {id:'benefits',title:'Выгоды и бонусы',icon:'Gift'},
  {id:'objections',title:'Работа с возражениями',icon:'MessageCircleQuestion'},
  {id:'faq',title:'База знаний / FAQ',icon:'BookOpenText'},
  {id:'plan',title:'План на 7 дней',icon:'CalendarCheck2'},
]
function I({name,size=18,...props}) { const Component=Icon[name] || Icon.Sparkles; return <Component size={size} strokeWidth={1.85} {...props} /> }
function storeState(key, initial) {
  const [value, setValue] = useState(() => {
    try { const raw=localStorage.getItem('swclient_'+key); return raw ? JSON.parse(raw) : initial } catch { return initial }
  })
  useEffect(() => { try { localStorage.setItem('swclient_'+key, JSON.stringify(value)) } catch {} }, [key,value])
  return [value,setValue]
}
function SwitchTabs({items,value,onChange}) { return <div className="tabs">{items.map(t=><button className={'tab '+(value===t.id?'active':'')} key={t.id} onClick={()=>onChange(t.id)}>{t.title}</button>)}</div> }
function PageTitle({eyebrow,title,desc,right}) { return <div className="page-heading"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1>{desc && <p>{desc}</p>}</div>{right && <div className="heading-actions">{right}</div>}</div> }
function Empty({icon='SearchX',title,description,action}) {return <div className="empty-state"><div className="empty-icon"><I name={icon} size={28}/></div><h3>{title}</h3><p>{description}</p>{action}</div>}
function MiniLogo() { return <div className="logo-mark"><I name="Snowflake" size={25} strokeWidth={1.4}/></div> }
function Badge({children,tone=''}) { return <span className={'badge '+tone}>{children}</span> }

export default function App() {
  const [view,setView] = useState('dashboard')
  const [mobileOpen,setMobileOpen] = useState(false)
  const [query,setQuery] = useState('')
  const [favoriteIds,setFavoriteIds] = storeState('favorites',[])
  const [completed,setCompleted] = storeState('journey',[])
  const [toast,setToast] = useState('')
  const [selectedAudience,setSelectedAudience] = useState(null)
  const [pickAudience,setPickAudience] = useState('friends')
  const [pickGoal,setPickGoal] = useState('first')
  const [pickLength,setPickLength] = useState('short')
  const [pickName,setPickName] = useState('')
  const [pickInterest,setPickInterest] = useState('')
  const [pickDraft,setPickDraft] = useState('')
  const [scriptAudience,setScriptAudience] = useState('all')
  const [scriptTerm,setScriptTerm] = useState('')
  const [scriptMode,setScriptMode] = useState('full')
  const [personalName,setPersonalName] = useState('')
  const [personalInterest,setPersonalInterest] = useState('')
  const [onlyFavorites,setOnlyFavorites] = useState(false)
  const [openedObjection,setOpenedObjection] = useState('o1')
  const [objectionCategory,setObjectionCategory] = useState('Все')
  const [objectionTerm,setObjectionTerm] = useState('')
  const [openedFaq,setOpenedFaq] = useState(0)
  const [faqCategory,setFaqCategory] = useState('Все')
  const [faqTerm,setFaqTerm] = useState('')
  const [points,setPoints] = useState(100)
  const [amount,setAmount] = useState(4800)

  // Clean up legacy CRM data from the first prototype; no contact records are retained.
  useEffect(()=>{ try { localStorage.removeItem('swclient_clients'); localStorage.removeItem('swclient_name') } catch {} },[])
  useEffect(()=>{ if(!toast)return;const t=setTimeout(()=>setToast(''),2900);return()=>clearTimeout(t) },[toast])
  function go(next) { setView(next);setMobileOpen(false);setQuery('');window.scrollTo({top:0,behavior:'smooth'}) }
  function goScript(audience) {setScriptAudience(audience || 'all');setOnlyFavorites(false);go('scripts')}
  function personalize(s) {return s.replaceAll('[имя]',personalName.trim()||'[имя]').replaceAll('[интерес]',personalInterest.trim()||'[интерес]')}
  async function copy(text) {
    try {await navigator.clipboard.writeText(text);setToast('Текст скопирован — можно отправлять ✨')}
    catch {const el=document.createElement('textarea');el.value=text;el.style.position='fixed';el.style.opacity='0';document.body.appendChild(el);el.select();document.execCommand('copy');el.remove();setToast('Текст скопирован')}
  }
  function toggleFavorite(id) { setFavoriteIds(old=>old.includes(id)?old.filter(x=>x!==id):[...old,id]) }
  const lookup=useMemo(()=>{
    const q=normalized(query.trim())
    if(!q)return []
    return [
      ...scripts.filter(s=>normalized(s.title+' '+s.full).includes(q)).map(s=>({id:s.id,title:s.title,sub:'Скрипт',view:'scripts',audience:s.audience})),
      ...audiences.filter(s=>normalized(s.title+' '+s.description).includes(q)).map(s=>({id:s.id,title:s.title,sub:'Категория',view:'audiences'})),
      ...objections.filter(s=>normalized(s.q+' '+s.a).includes(q)).map(s=>({id:s.id,title:s.q,sub:'Возражение',view:'objections'})),
      ...faqs.filter(s=>normalized(s.q+' '+s.a).includes(q)).map(s=>({id:s.q,title:s.q,sub:'FAQ',view:'faq'})),
    ].slice(0,7)
  },[query])
  function openSearchResult(result) { if(result.view==='scripts')setScriptAudience(result.audience);if(result.view==='audiences')setSelectedAudience(result.id);if(result.view==='objections')setOpenedObjection(result.id);go(result.view) }
  const filteredScripts=useMemo(()=>scripts.filter(s=>(scriptAudience==='all'||s.audience===scriptAudience)&&(!onlyFavorites||favoriteIds.includes(s.id))&&normalized(s.title+' '+s.full+' '+s.occasion).includes(normalized(scriptTerm))),[scriptAudience,onlyFavorites,favoriteIds,scriptTerm])
  const filteredObjections=useMemo(()=>objections.filter(o=>(objectionCategory==='Все'||o.category===objectionCategory)&&normalized(o.q+' '+o.a).includes(normalized(objectionTerm))),[objectionCategory,objectionTerm])
  const filteredFaq=useMemo(()=>faqs.map((f,i)=>({...f,index:i})).filter(f=>(faqCategory==='Все'||f.category===faqCategory)&&normalized(f.q+' '+f.a).includes(normalized(faqTerm))),[faqCategory,faqTerm])
  const pickSelected = useMemo(() => {
    if(pickGoal==='interested') return scripts.find(s=>s.id==='s13')
    if(pickGoal==='reminder') return scripts.find(s=>s.id==='s14')
    return scripts.find(s=>s.audience===pickAudience && !['s13','s14'].includes(s.id)) || scripts[0]
  },[pickAudience,pickGoal])
  const pickText = useMemo(() =>
    (pickSelected?.[pickLength]||'')
      .replaceAll('[имя]',pickName.trim()||'[имя]')
      .replaceAll('[интерес]',pickInterest.trim()||'[интерес]'),
    [pickSelected,pickLength,pickName,pickInterest]
  )
  useEffect(()=>setPickDraft(pickText),[pickText])
  const rate=points>=100?15:points>=50?10:points>=30?5:0
  const calc=Math.round(Math.max(0,Number(amount)||0)*rate/100)
  const remaining = points>=100?0:points>=50?100-points:points>=30?50-points:30-points
  const nextRate=points>=100?15:points>=50?15:points>=30?10:5
  const progress=Math.round(completed.length/journey.length*100)

  return <div className="app-shell">
    {mobileOpen&&<button className="mobile-overlay" aria-label="Закрыть меню" onClick={()=>setMobileOpen(false)} />}
    <aside className={'sidebar '+(mobileOpen?'mobile-open':'')}>
      <div className="brand" onClick={()=>go('dashboard')} role="button" tabIndex={0} onKeyDown={e=>e.key==='Enter'&&go('dashboard')}><MiniLogo/><div><strong>SW <span>CLIENT</span></strong><small>STUDIO · TEAM SPACE</small></div></div>
      <div className="sidebar-caption">РАБОЧЕЕ ПРОСТРАНСТВО</div>
      <nav className="sidebar-nav">{MENU.map(m=><button key={m.id} className={'nav-item '+(view===m.id?'active':'')} onClick={()=>go(m.id)}><I name={m.icon} size={19}/><span>{m.title}</span>{view===m.id&&<span className="nav-dot"/>}</button>)}</nav>
      <div className="sidebar-bottom">
        <div className="sidebar-tip"><I name="Sparkles" size={21}/><strong>Искусство рекомендации</strong><p>Не продавай с первого сообщения. Начни с живого диалога и интереса человека.</p></div>
        <div className="sidebar-footer"><span className="online-dot"/> Создано для команды SW <span>2026</span></div>
      </div>
    </aside>
    <div className="main-shell">
      <header className="topbar">
        <button className="icon-button hamburger" aria-label="Открыть меню" onClick={()=>setMobileOpen(true)}><I name="Menu" size={21}/></button>
        <div className="topbar-breadcrumb">КОМАНДНОЕ ПРОСТРАНСТВО <I name="ChevronRight" size={13}/> <strong>{MENU.find(m=>m.id===view)?.title}</strong></div>
        <div className="topbar-right">
          <div className="search-wrap">
            <I name="Search" size={18}/><input aria-label="Поиск по базе" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Поиск по всей базе..."/>{query&&<button aria-label="Очистить" className="clear-search" onClick={()=>setQuery('')}><I name="X" size={16}/></button>}
            {query.trim()&&<div className="search-results">{lookup.length?lookup.map(r=><button key={r.sub+r.id} onClick={()=>openSearchResult(r)}><span className="result-icon"><I name={r.view==='scripts'?'MessageSquare':r.view==='audiences'?'Users':'CircleHelp'} size={17}/></span><span><strong>{r.title}</strong><small>{r.sub}</small></span><I name="ArrowUpRight" size={16}/></button>):<div className="no-results">По запросу ничего не найдено</div>}</div>}
          </div>
          <button className="avatar-button" title="Быстрый подбор сообщения" onClick={()=>go('picker')}><I name="WandSparkles" size={19}/></button>
        </div>
      </header>
      <main className="content">
        {view==='dashboard'&&<>
          <section className="hero">
            <div className="hero-content"><div className="hero-kicker"><span className="mini-star">✳</span> ТВОЁ КЛИЕНТСКОЕ ПРОСТРАНСТВО</div><h1>Лёгкие диалоги.<br/><em>Сильные отношения.</em></h1><p>Всё для уверенной работы с клиентами Siberian Wellness — от первого «привет» до долгосрочного знакомства с продуктом.</p><div className="hero-actions"><button className="btn btn-dark" onClick={()=>go('picker')}>Подобрать сообщение <I name="ArrowUpRight" size={17}/></button><button className="btn btn-glass" onClick={()=>goScript('all')}>Все скрипты <I name="ArrowRight" size={17}/></button></div></div>
            <div className="hero-art" aria-hidden="true"><div className="orb orb-one"/><div className="orb orb-two"/><div className="glass-slab slab-back"><div className="slab-snow">✳</div></div><div className="glass-slab slab-front"><span>CLIENT EXPERIENCE</span><strong>01<span> / 07</span></strong><div className="fake-line"/><div className="fake-line short"/><div className="gold-rim"/></div><div className="floating-chip chip-one"><I name="Heart" size={15}/> Доверие</div><div className="floating-chip chip-two"><I name="Sparkles" size={15}/> Забота</div></div>
          </section>
          <div className="stats-grid">
            {[{icon:'MessagesSquare',number:scripts.length,label:'Готовых скриптов',tone:'sage'},{icon:'UsersRound',number:audiences.length,label:'Категорий клиентов',tone:'peach'},{icon:'MessageCircleQuestion',number:objections.length,label:'Ответов на возражения',tone:'lavender'},{icon:'Heart',number:favoriteIds.length,label:'В избранном',tone:'gold'}].map(s=><div className="stat-card" key={s.label}><div className={'stat-icon '+s.tone}><I name={s.icon} size={21}/></div><strong>{s.number}</strong><p>{s.label}</p></div>)}
          </div>
          <div className="section-label-row"><div><div className="eyebrow">НАВИГАЦИЯ</div><h2>Всё под рукой</h2></div><span className="muted-caption">Начни с нужного инструмента</span></div>
          <div className="feature-grid">
            {[
              {id:'picker',icon:'WandSparkles',n:'01',title:'Подобрать за 10 секунд',desc:'Выбери человека и ситуацию — скрипт готов к копированию',tone:'sage'},
              {id:'scripts',icon:'MessagesSquare',n:'02',title:'Открыть все скрипты',desc:'Поиск, фильтры, короткие версии и любимые шаблоны',tone:'peach'},
              {id:'benefits',icon:'Gift',n:'03',title:'Показать выгоду',desc:'Кешбэк, подарки, условия и интерактивный расчёт',tone:'gold'},
              {id:'objections',icon:'MessageCircleQuestion',n:'04',title:'Ответить уверенно',desc:'Частые сомнения и экологичные варианты ответов',tone:'lavender'},
            ].map(item=><button className="feature-card" key={item.id} onClick={()=>go(item.id)}><div className="feature-top"><span className={'feature-icon '+item.tone}><I name={item.icon} size={25}/></span><span className="feature-number">{item.n}</span></div><h3>{item.title}</h3><p>{item.desc}</p><span className="feature-link">Открыть раздел <I name="ArrowUpRight" size={17}/></span></button>)}
          </div>
          <div className="instant-copy">
            <div className="instant-copy-icon"><I name="CopyCheck" size={23}/></div>
            <div className="instant-copy-main"><span className="eyebrow">СКРИПТ НАЧАЛА ДИАЛОГА</span><strong>Первое сообщение другу — в один клик</strong><p>{scripts[0].short}</p></div>
            <button className="btn btn-dark" onClick={()=>copy(scripts[0].short)}><I name="Copy" size={17}/> Скопировать</button>
          </div>
          <div className="dashboard-bottom">
            <div className="panel progress-panel"><div className="panel-top"><span className="eyebrow">ПРОГРЕСС КОМАНДЫ</span><Badge tone="mint">7 шагов</Badge></div><h2>Твой первый клиентский маршрут</h2><p>Небольшие действия каждый день помогут превратить знания в понятную систему.</p><div className="progress-row"><strong>{progress}%</strong><span>{completed.length} из 7 шагов выполнено</span></div><div className="progress-track"><div style={{width:progress+'%'}}/></div><button className="text-link" onClick={()=>go('plan')}>Продолжить обучение <I name="ArrowRight" size={17}/></button></div>
            <div className="panel quote-panel"><div className="quote-spark">✳</div><div className="eyebrow">НАША ФИЛОСОФИЯ</div><blockquote>«Сначала интерес человека.<br/>Потом — предложение.»</blockquote><p>Хорошая рекомендация начинается с уважения к выбору, а не с давления.</p></div>
          </div>
        </>}

        {view==='picker'&&<>
          <PageTitle eyebrow="01 / БЫСТРЫЙ ИНСТРУМЕНТ" title="Подобрать скрипт за 10 секунд" desc="Три выбора — и нужное сообщение готово. Можно подставить имя, отредактировать текст и сразу скопировать." right={<Badge tone="mint"><I name="Zap" size={14}/> Без лишних шагов</Badge>}/>
          <div className="quickpick-layout">
            <div className="panel pick-config">
              <div className="pick-heading"><span className="step-dot">1</span><div><h2>Кому пишем?</h2><p>Выбери, к какому окружению относится человек</p></div></div>
              <div className="pick-audiences">{audiences.map(a=><button key={a.id} className={'pick-audience '+(pickAudience===a.id?'active':'')} onClick={()=>setPickAudience(a.id)}><I name={a.icon} size={17}/><span>{a.title}</span>{pickAudience===a.id&&<I name="Check" size={15}/>}</button>)}</div>
              <div className="pick-heading next-step"><span className="step-dot">2</span><div><h2>Какая ситуация?</h2><p>Предложение подберётся под задачу общения</p></div></div>
              <div className="pick-goals">{[
                {id:'first',name:'Первое приглашение',hint:'Познакомить с магазином',icon:'MessageSquare'},
                {id:'interested',name:'Ответ «интересно»',hint:'Продолжить диалог',icon:'MessageCircle'},
                {id:'reminder',name:'Мягкое напоминание',hint:'Если ответа пока нет',icon:'Clock3'}
              ].map(g=><button key={g.id} className={'pick-goal '+(pickGoal===g.id?'active':'')} onClick={()=>setPickGoal(g.id)}><span className="goal-icon"><I name={g.icon} size={20}/></span><span><strong>{g.name}</strong><small>{g.hint}</small></span><I name={pickGoal===g.id?'CircleCheck':'Circle'} size={20}/></button>)}</div>
            </div>
            <div className="pick-preview-column">
              <div className="pick-preview">
                <div className="pick-preview-header"><div><span className="eyebrow">ТВОЙ ГОТОВЫЙ СКРИПТ</span><h2>{pickSelected?.title}</h2></div><I name="Sparkles" size={23}/></div>
                <div className="pick-length-row"><span>Длина сообщения</span><SwitchTabs items={[{id:'short',title:'Короткий'},{id:'full',title:'Подробный'}]} value={pickLength} onChange={setPickLength}/></div>
                <div className="pick-names">
                  <div className="field compact"><label htmlFor="quick-name">Имя</label><input id="quick-name" value={pickName} onChange={e=>setPickName(e.target.value)} placeholder="Как зовут человека"/></div>
                  <div className="field compact"><label htmlFor="quick-interest">Интерес</label><input id="quick-interest" value={pickInterest} onChange={e=>setPickInterest(e.target.value)} placeholder="Например, косметика"/></div>
                </div>
                <label className="draft-label" htmlFor="quick-draft">Сообщение · можно отредактировать</label>
                <textarea id="quick-draft" className="pick-draft" rows={10} value={pickDraft} onChange={e=>setPickDraft(e.target.value)} />
                <div className="pick-preview-actions">
                  <button className="btn btn-outline" onClick={()=>setPickDraft(pickText)}><I name="RotateCcw" size={17}/> Вернуть оригинал</button>
                  <button className="btn btn-dark pick-copy" onClick={()=>copy(pickDraft)} disabled={!pickDraft.trim()}><I name="Copy" size={18}/> Скопировать скрипт</button>
                </div>
                <div className="pick-ethical"><I name="HeartHandshake" size={18}/><span>Персонализируй приглашение, не дави на человека и проверяй актуальные условия программы.</span></div>
              </div>
              <div className="pick-links">
                <button onClick={()=>goScript(pickAudience)}><I name="MessagesSquare" size={20}/><span><strong>Посмотреть другие варианты</strong><small>Все скрипты для этой аудитории</small></span><I name="ArrowUpRight" size={18}/></button>
                <button onClick={()=>go('objections')}><I name="MessageCircleQuestion" size={20}/><span><strong>Ответить на сомнение</strong><small>База коротких ответов</small></span><I name="ArrowUpRight" size={18}/></button>
              </div>
            </div>
          </div>
        </>}
        {view==='audiences'&&<>
          <PageTitle eyebrow="01 / ПОНИМАЕМ КЛИЕНТА" title="Категории клиентов" desc="Для каждого окружения — свой подход, подходящий тон и понятный первый шаг." right={<Badge tone="mint">{audiences.length} категорий</Badge>}/>
          <div className="audience-grid">{audiences.map(a=><button className={'audience-card '+(selectedAudience===a.id?'selected':'')} key={a.id} onClick={()=>setSelectedAudience(selectedAudience===a.id?null:a.id)}><div className="audience-top"><span className={'audience-icon '+a.tint}><I name={a.icon} size={25}/></span><I name="ArrowUpRight" size={19}/></div><h3>{a.title}</h3><span className="subline">{a.subtitle}</span><p>{a.description}</p><div className="audience-bottom"><span>{scripts.filter(s=>s.audience===a.id).length} сценария / подборка</span><I name="ChevronRight" size={17}/></div></button>)}</div>
          {selectedAudience&&(()=>{const a=audiences.find(x=>x.id===selectedAudience);return a?<div className="detail-panel"><div className="detail-panel-head"><div><span className="eyebrow">СТРАТЕГИЯ ОБЩЕНИЯ</span><h2>{a.title} — как начать разговор</h2></div><button className="icon-button" aria-label="Закрыть" onClick={()=>setSelectedAudience(null)}><I name="X" size={20}/></button></div><div className="detail-grid"><div><span className="detail-caption">ОТ ЧЕГО ОТТАЛКИВАТЬСЯ</span><p><I name="Target" size={18}/>{a.hook}</p></div><div><span className="detail-caption">ЧТО ДЕЛАТЬ</span><p><I name="CheckCircle2" size={18}/>{a.approach}</p></div><div><span className="detail-caption">ЧЕГО ИЗБЕГАТЬ</span><p><I name="ShieldAlert" size={18}/>{a.avoid}</p></div></div><button className="btn btn-dark" onClick={()=>goScript(a.id)}>Смотреть готовые сообщения <I name="ArrowRight" size={17}/></button></div>:null})()}
        </>}
        {view==='scripts'&&<>
          <PageTitle eyebrow="02 / СЛОВА, КОТОРЫЕ ПОМОГАЮТ" title="Библиотека скриптов" desc="Выбирай аудиторию, подставляй имя, меняй тон и копируй готовое сообщение." right={<button className="btn btn-outline" onClick={()=>{setOnlyFavorites(!onlyFavorites);setScriptAudience('all')}}><I name="Heart" size={17} fill={onlyFavorites?'currentColor':'none'}/>{onlyFavorites?'Все скрипты':'Избранное'} <span className="count-pill">{favoriteIds.length}</span></button>}/>
          <div className="script-toolbar panel"><div className="script-toolbar-main"><div className="field compact"><label>Имя получателя</label><input value={personalName} onChange={e=>setPersonalName(e.target.value)} placeholder="Например, Анна"/></div><div className="field compact"><label>Интерес человека</label><input value={personalInterest} onChange={e=>setPersonalInterest(e.target.value)} placeholder="Например, уход за кожей"/></div><div className="field compact script-search"><label>Поиск сценария</label><div className="input-icon"><I name="Search" size={16}/><input value={scriptTerm} onChange={e=>setScriptTerm(e.target.value)} placeholder="По названию или тексту"/></div></div></div><div className="toolbar-hint"><I name="WandSparkles" size={16}/> Поля [имя] и [интерес] автоматически заменятся в сообщениях. Редактируй текст под свой голос.</div></div>
          <div className="filter-bar"><div className="chip-scroll"><button className={'filter-chip '+(scriptAudience==='all'?'active':'')} onClick={()=>setScriptAudience('all')}>Все сообщения</button>{audiences.map(a=><button key={a.id} className={'filter-chip '+(scriptAudience===a.id?'active':'')} onClick={()=>setScriptAudience(a.id)}>{a.title}</button>)}</div><SwitchTabs items={[{id:'full',title:'Развёрнутые'},{id:'short',title:'Короткие'}]} value={scriptMode} onChange={setScriptMode}/></div>
          <div className="results-count">Найдено сообщений: <strong>{filteredScripts.length}</strong></div>
          {filteredScripts.length?<div className="scripts-grid">{filteredScripts.map((s,i)=>{const audience=audiences.find(x=>x.id===s.audience);const value=personalize(s[scriptMode]);return <article className="script-card" key={s.id}><div className="script-card-head"><div className="script-number">{String(i+1).padStart(2,'0')}</div><div className="script-card-title"><h3>{s.title}</h3><span>{s.occasion}</span></div><button className={'fav-button '+(favoriteIds.includes(s.id)?'on':'')} aria-label="Добавить в избранное" onClick={()=>toggleFavorite(s.id)}><I name="Heart" size={19} fill={favoriteIds.includes(s.id)?'currentColor':'none'}/></button></div><div className="script-text">{value}</div><div className="script-card-footer"><Badge tone={audience?.tint||'mint'}>{audience?.title}</Badge><button className="copy-button" onClick={()=>copy(value)}><I name="Copy" size={16}/> Копировать <I name="ArrowUpRight" size={15}/></button></div></article>})}</div>:<Empty title="Пока ничего не найдено" description="Попробуй другую категорию или очисти поиск." action={<button className="btn btn-outline" onClick={()=>{setScriptAudience('all');setScriptTerm('');setOnlyFavorites(false)}}>Сбросить фильтры</button>}/>}
          <div className="note-box"><I name="Info" size={19}/><p>Шаблоны — отправная точка, а не массовая рассылка. Пиши конкретному человеку, не делай недоказанных заявлений о продукции и уважай отказ.</p></div>
        </>}
        {view==='benefits'&&<>
          <PageTitle eyebrow="03 / КЛИЕНТСКАЯ ПРОГРАММА" title="Выгоды и бонусы" desc="Понятное объяснение программы лояльности, которое можно использовать в разговоре с клиентом."/>
          <div className="benefits-grid">{benefits.map((b,i)=><div className="benefit-card" key={b.id}><span className="benefit-index">0{i+1}</span><span className="benefit-mark">{b.mark}</span><h3>{b.name}</h3><p>{b.desc}</p><small>{b.foot}</small></div>)}</div>
          <div className="calc-grid">
            <div className="panel calculator"><div className="panel-top"><div><span className="eyebrow">ИНТЕРАКТИВНЫЙ ИНСТРУМЕНТ</span><h2>Калькулятор кешбэка</h2></div><span className="calc-icon"><I name="Calculator" size={23}/></span></div><p>Выставь количество баллов и сумму корзины без НДС, чтобы показать пример начисления.</p><div className="calc-field-title"><label htmlFor="points">Баллы покупки за месяц</label><strong>{points} б.</strong></div><input id="points" className="range" type="range" min="0" max="200" step="1" value={points} onChange={e=>setPoints(Number(e.target.value))}/><div className="range-labels"><span>0</span><span>30</span><span>50</span><span>100</span><span>200</span></div><div className="field"><label htmlFor="purchase">Сумма покупки без НДС, ₽</label><input id="purchase" type="number" min="0" max="10000000" value={amount} onChange={e=>setAmount(e.target.value)} /></div><div className="rate-steps">{[{n:'30+',p:'5%'},{n:'50+',p:'10%'},{n:'100+',p:'15%'}].map(s=><span className={(rate>=parseInt(s.p)?'active':'')} key={s.n}><strong>{s.p}</strong><small>от {s.n} баллов</small></span>)}</div></div>
            <div className="calc-result"><div className="result-top"><span>ПРИМЕР РАСЧЁТА</span><I name="Sparkles" size={23}/></div><p>При выбранных условиях кешбэк</p><div className="result-rate">{rate}<span>%</span></div><div className="result-money">≈ {calc.toLocaleString('ru-RU')} ₽ <span>бонусами</span></div><div className="result-divider"/><p className="result-next">{points>=100?'Максимальный уровень кешбэка по программе достигнут.':'До следующего уровня ('+nextRate+'%) осталось '+remaining+' баллов.'}</p><button onClick={()=>copy('Кешбэк по программе Siberian Wellness: '+rate+'% при '+points+' баллах. При сумме покупки без НДС '+Number(amount).toLocaleString('ru-RU')+' ₽ это около '+calc.toLocaleString('ru-RU')+' ₽ бонусами на следующие покупки. Условия: 31-й бизнес-год, РФ.')} className="result-copy">Скопировать расчёт <I name="Copy" size={16}/></button></div>
          </div>
          <div className="benefits-explainer"><div className="explain-icon"><I name="Gift" size={27}/></div><div><div className="eyebrow">КЛУБ ПОСТОЯНСТВА</div><h2>Покупки с приятным продолжением</h2><p>Три месяца подряд с покупками от 50 баллов — и клиент может выбрать подарок из ассортимента программы. Это отдельная выгода в дополнение к кешбэку.</p><button className="text-link" onClick={()=>copy('В Siberian Wellness есть Клуб постоянства: при покупках от 50 баллов три месяца подряд можно выбрать подарок из специального ассортимента программы. Плюс доступен кешбэк за покупки при выполнении его условий.')}>Скопировать короткое объяснение <I name="Copy" size={16}/></button></div><div className="months"><span>01<small>МЕСЯЦ</small></span><I name="ArrowRight" size={18}/><span>02<small>МЕСЯЦ</small></span><I name="ArrowRight" size={18}/><span className="month-gift"><I name="Gift" size={25}/><small>ПОДАРОК</small></span></div></div>
          <div className="note-box"><I name="ShieldCheck" size={20}/><p><strong>Точные условия:</strong> кешбэк начисляется от стоимости без НДС и используется для будущих покупок. Порог определяется баллами, а не фиксированной суммой в рублях. Реферальный сертификат 500 ₽ в документе ограничен датой 31.12.2026 — уточняйте продление перед использованием. <a href="https://siberianwellness.com" target="_blank" rel="noreferrer">Официальный сайт <I name="ExternalLink" size={13}/></a></p></div>
          <div className="source-note">{programSource}</div>
        </>}
        {view==='objections'&&<>
          <PageTitle eyebrow="04 / УВЕРЕННАЯ КОММУНИКАЦИЯ" title="Работа с возражениями" desc="Не переубеждай любой ценой: помогай человеку спокойно разобраться и принять решение." right={<Badge tone="mint">{objections.length} ответов</Badge>}/>
          <div className="resource-toolbar"><div className="input-icon"><I name="Search" size={18}/><input value={objectionTerm} onChange={e=>setObjectionTerm(e.target.value)} placeholder="Найти вопрос или ответ..."/></div><div className="chip-scroll">{['Все',...new Set(objections.map(o=>o.category))].map(c=><button key={c} className={'filter-chip '+(c===objectionCategory?'active':'')} onClick={()=>setObjectionCategory(c)}>{c}</button>)}</div></div>
          <div className="accordion-list">{filteredObjections.map((o,i)=><div className={'accordion '+(openedObjection===o.id?'open':'')} key={o.id}><button className="accordion-button" onClick={()=>setOpenedObjection(openedObjection===o.id?'':o.id)}><span className="accordion-index">{String(i+1).padStart(2,'0')}</span><span className="accordion-text"><strong>{o.q}</strong><small>{o.category}</small></span><I name={openedObjection===o.id?'Minus':'Plus'} size={20}/></button>{openedObjection===o.id&&<div className="accordion-body"><div className="answer-label"><I name="MessageSquareText" size={16}/> ЧТО МОЖНО ОТВЕТИТЬ</div><p className="answer-text">{o.a}</p><div className="answer-bottom"><span><I name="Ban" size={15}/> Не стоит: {o.avoid}</span><button className="copy-button" onClick={()=>copy(o.a)}><I name="Copy" size={16}/> Копировать ответ</button></div></div>}</div>)}</div>
          {!filteredObjections.length&&<Empty title="Ничего не найдено" description="Измени запрос или фильтр."/>}
        </>}
        {view==='faq'&&<>
          <PageTitle eyebrow="05 / ЗНАНИЯ В ОДНОМ МЕСТЕ" title="Вопросы и ответы" desc="Быстрая справка по регистрации, баллам, кешбэку, подаркам и клиентским условиям." right={<Badge tone="mint">{faqs.length} ответов</Badge>}/>
          <div className="resource-toolbar"><div className="input-icon"><I name="Search" size={18}/><input value={faqTerm} onChange={e=>setFaqTerm(e.target.value)} placeholder="Поиск по базе знаний..."/></div><div className="chip-scroll">{['Все',...new Set(faqs.map(f=>f.category))].map(c=><button key={c} className={'filter-chip '+(c===faqCategory?'active':'')} onClick={()=>setFaqCategory(c)}>{c}</button>)}</div></div>
          <div className="faq-layout"><div className="accordion-list">{filteredFaq.map(f=><div className={'accordion '+(openedFaq===f.index?'open':'')} key={f.index}><button className="accordion-button" onClick={()=>setOpenedFaq(openedFaq===f.index?-1:f.index)}><span className="faq-question-icon"><I name="CircleHelp" size={19}/></span><span className="accordion-text"><strong>{f.q}</strong><small>{f.category}</small></span><I name={openedFaq===f.index?'Minus':'Plus'} size={19}/></button>{openedFaq===f.index&&<div className="accordion-body faq-answer"><p>{f.a}</p><button className="copy-button" onClick={()=>copy(f.a)}><I name="Copy" size={16}/> Копировать ответ</button></div>}</div>)}</div><aside className="faq-aside"><div className="faq-aside-icon"><I name="BookOpen" size={27}/></div><h3>Знание рождает уверенность</h3><p>Лучше спокойно объяснить условия, чем обещать клиенту то, чего нет в программе.</p><hr/><span className="eyebrow">ИСТОЧНИК</span><p className="small">{programSource}</p><a href="https://siberianwellness.com" target="_blank" rel="noreferrer" className="text-link">Проверить условия <I name="ArrowUpRight" size={16}/></a></aside></div>
        </>}
        {view==='plan'&&<>
          <PageTitle eyebrow="07 / ОТ ЗНАНИЙ К ДЕЙСТВИЯМ" title="План на 7 дней" desc="Простой маршрут для новичка: изучаем, знакомимся, помогаем выбрать и анализируем." right={<Badge tone="mint">{progress}% выполнено</Badge>}/>
          <div className="plan-hero"><div><span className="eyebrow">ТВОЙ ПРОГРЕСС</span><h2>Маленькие действия.<br/>Большая системность.</h2><p>Отмечай выполненные задания — прогресс сохранится в браузере.</p></div><div className="plan-ring" style={{background:'conic-gradient(#c8ad76 '+progress+'%,rgba(255,255,255,.15) '+progress+'%)'}}><div><strong>{progress}%</strong><small>ГОТОВО</small></div></div></div>
          <div className="plan-steps">{journey.map((j,i)=><div className={'plan-step '+(completed.includes(i)?'done':'')} key={i}><div className="plan-step-number">{String(j.day).padStart(2,'0')}</div><div className="plan-step-content"><div className="eyebrow">ДЕНЬ {j.day}</div><h3>{j.title}</h3><p>{j.desc}</p><span className="plan-prompt"><I name="Lightbulb" size={15}/> {j.task}</span></div><button className={'complete-button '+(completed.includes(i)?'done':'')} onClick={()=>setCompleted(old=>old.includes(i)?old.filter(x=>x!==i):[...old,i])}><I name={completed.includes(i)?'CheckCircle2':'Circle'} size={19}/>{completed.includes(i)?'Выполнено':'Отметить'}</button></div>)}</div><div className="plan-final"><div><I name="PartyPopper" size={25}/><h3>Главное — создавать доверие</h3><p>Цель недели — не количество продаж, а качественные диалоги и понимание клиентских потребностей.</p></div><button className="btn btn-outline" onClick={()=>{setCompleted([]);setToast('Прогресс недели сброшен')}}>Начать заново <I name="RotateCcw" size={16}/></button></div>
        </>}
        <footer className="page-footer"><span>✳ SW CLIENT STUDIO</span><span>С заботой о клиенте · Для команды Siberian Wellness</span><span>Версия 1.1 · 2026</span></footer>
      </main>
    </div>
    {toast&&<div className="toast"><I name="CheckCircle2" size={18}/>{toast}</div>}
  </div>
}
