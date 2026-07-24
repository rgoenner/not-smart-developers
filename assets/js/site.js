const agentStyles=document.createElement('link');agentStyles.rel='stylesheet';agentStyles.href='assets/css/security-agent.css';document.head.appendChild(agentStyles);

const menuButton=document.querySelector('.menu-button');
const nav=document.querySelector('.site-nav');
if(menuButton&&nav){
  menuButton.addEventListener('click',()=>{
    const open=nav.classList.toggle('open');
    menuButton.setAttribute('aria-expanded',String(open));
  });
  nav.addEventListener('click',event=>{
    if(event.target.matches('a')){
      nav.classList.remove('open');
      menuButton.setAttribute('aria-expanded','false');
    }
  });
}

const transcript=document.querySelector('#agent-transcript');
const agentForm=document.querySelector('#agent-form');
const agentQuestion=document.querySelector('#agent-question');
const promptButtons=document.querySelectorAll('[data-agent-prompt]');

const responses={
  phishing:{
    question:'How should I triage a suspected phishing message?',
    intro:'Treat the message as evidence first and an inconvenience second:',
    sections:[
      ['Preserve','Retain the original message, headers, URLs, attachments, delivery details, and reports from affected users.'],
      ['Investigate','Identify recipients, review link and attachment activity, correlate identity events, and determine whether credentials or sessions were exposed.'],
      ['Contain','Remove confirmed malicious messages, block validated indicators, revoke compromised sessions, reset affected credentials, and monitor for follow-on activity.']
    ]
  },
  ransomware:{
    question:'What are the first steps in a ransomware response?',
    intro:'Prioritize containment and evidence preservation over restoring the appearance of normality:',
    sections:[
      ['Contain','Isolate affected systems and network segments while preserving access for authorized responders. Avoid destroying volatile evidence.'],
      ['Scope','Determine affected identities, endpoints, servers, backups, cloud services, and likely initial access. Look for persistence and lateral movement.'],
      ['Recover','Use validated clean backups, rotate exposed secrets, rebuild compromised systems where appropriate, and monitor closely before declaring recovery.']
    ]
  },
  'zero-trust':{
    question:'How should we approach Zero Trust?',
    intro:'Begin with enforceable decisions rather than a logo-covered reference architecture:',
    sections:[
      ['Inventory','Identify users, workloads, devices, data, trust relationships, and the access paths that currently bypass policy.'],
      ['Verify','Use strong identity, device posture, contextual signals, least privilege, and explicit authorization for meaningful access decisions.'],
      ['Measure','Instrument policy outcomes, failed access, privilege use, exceptions, and segmentation gaps. Rarely verify is branding, not architecture.']
    ]
  },
  default:{
    question:null,
    intro:'A defensible starting point is to reduce uncertainty before increasing confidence:',
    sections:[
      ['Observe','Collect relevant logs, endpoint evidence, identity activity, network context, timelines, and known changes.'],
      ['Decide','Define what is known, what is assumed, the immediate risk, and the safest reversible containment action.'],
      ['Validate','Confirm that controls, alerts, backups, and response procedures work under realistic conditions rather than relying on documentation alone.']
    ]
  }
};

function escapeHtml(value){
  return value.replace(/[&<>'"]/g,character=>({
    '&':'&amp;',
    '<':'&lt;',
    '>':'&gt;',
    "'":'&#39;',
    '"':'&quot;'
  })[character]);
}

function addUserMessage(message){
  const node=document.createElement('div');
  node.className='chat-message user-message';
  node.textContent=message;
  transcript.appendChild(node);
}

function addAgentResponse(response){
  const node=document.createElement('div');
  node.className='chat-message assistant-message';
  const sections=response.sections.map(([title,body])=>`<div class="response-block"><b>${escapeHtml(title)}</b><span>${escapeHtml(body)}</span></div>`).join('');
  node.innerHTML=`<p>${escapeHtml(response.intro)}</p>${sections}<small>Recommendation confidence: professionally reassuring</small>`;
  transcript.appendChild(node);
  transcript.scrollTop=transcript.scrollHeight;
}

function askAgent(question,key='default'){
  const cleanQuestion=question.trim();
  if(!cleanQuestion)return;
  addUserMessage(cleanQuestion);
  agentQuestion.value='';
  const thinking=document.createElement('div');
  thinking.className='chat-message assistant-message';
  thinking.innerHTML='<span class="agent-thinking" aria-label="grep-GPT is considering the evidence"><i></i><i></i><i></i></span>';
  transcript.appendChild(thinking);
  transcript.scrollTop=transcript.scrollHeight;
  window.setTimeout(()=>{
    thinking.remove();
    addAgentResponse(responses[key]||responses.default);
  },550);
}

promptButtons.forEach(button=>{
  button.addEventListener('click',()=>{
    const key=button.dataset.agentPrompt;
    askAgent(responses[key].question,key);
  });
});

if(agentForm&&agentQuestion&&transcript){
  agentForm.addEventListener('submit',event=>{
    event.preventDefault();
    const question=agentQuestion.value;
    const normalized=question.toLowerCase();
    let key='default';
    if(normalized.includes('phish'))key='phishing';
    else if(normalized.includes('ransom')||normalized.includes('malware'))key='ransomware';
    else if(normalized.includes('zero trust')||normalized.includes('least privilege'))key='zero-trust';
    askAgent(question,key);
  });
}
