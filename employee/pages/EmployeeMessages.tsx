import React, { useState } from 'react';
import { MessageSquare, Send, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import PageHeader from '../../components/PageHeader';

const EmployeeMessages = () => {
  const { user } = useAuth();
  const { data } = useData();
  const [selectedContact, setSelectedContact] = useState<number | null>(
    data.contacts.length > 0 ? data.contacts[0].id : null
  );
  const [messageText, setMessageText] = useState('');
  const [searchContact, setSearchContact] = useState('');

  const filteredContacts = data.contacts.filter(c =>
    c.name.toLowerCase().includes(searchContact.toLowerCase())
  );
  const activeContact = data.contacts.find(c => c.id === selectedContact);

  const handleSend = () => {
    if (!messageText.trim()) return;
    setMessageText('');
  };

  return (
    <div className="space-y-6 fade-in">


      <div className="bg-main-surface rounded-2xl border border-main-border shadow-sm overflow-hidden" style={{ height: 'calc(100vh - 220px)' }}>
        <div className="flex h-full">
          {/* Contact List */}
          <div className="w-72 border-r border-main-border flex flex-col">
            <div className="p-3 border-b border-main-border">
              <div className="flex items-center bg-main-bg rounded-full px-3 py-1.5 border border-main-border">
                <Search size={14} className="text-slate-400" />
                <input
                  type="text"
                  value={searchContact}
                  onChange={e => setSearchContact(e.target.value)}
                  placeholder="Search contacts..."
                  className="bg-transparent border-none outline-none text-sm text-main-heading placeholder-slate-400 ml-2 w-full"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {filteredContacts.map(contact => (
                <button
                  key={contact.id}
                  onClick={() => setSelectedContact(contact.id)}
                  className={`w-full flex items-center gap-3 p-3 text-left transition-colors ${
                    selectedContact === contact.id
                      ? 'bg-brand-primary/10'
                      : 'hover:bg-main-bg'
                  }`}
                >
                  <img src={contact.avatar} alt={contact.name} className="w-10 h-10 rounded-full object-cover border border-main-border" />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <p className="text-base font-bold text-main-heading truncate">{contact.name}</p>
                      <span className="text-xs text-slate-400">{contact.time}</span>
                    </div>
                    <p className="text-sm text-slate-500 truncate">{contact.lastMsg}</p>
                  </div>
                  {contact.unread > 0 && (
                    <span className="w-5 h-5 bg-brand-primary text-brand-primary-text rounded-full text-xs font-bold flex items-center justify-center">
                      {contact.unread}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {activeContact ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-main-border flex items-center gap-3">
                  <img src={activeContact.avatar} alt={activeContact.name} className="w-9 h-9 rounded-full object-cover border border-main-border" />
                  <div>
                    <p className="text-base font-bold text-main-heading">{activeContact.name}</p>
                    <p className="text-xs text-emerald-500 font-medium">Online</p>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 flex flex-col justify-end">
                  <div className="space-y-3">
                    <div className="flex justify-start">
                      <div className="bg-main-bg rounded-2xl rounded-bl-md px-4 py-2.5 max-w-[70%]">
                        <p className="text-base text-main-heading">{activeContact.lastMsg}</p>
                        <p className="text-xs text-slate-400 mt-1">{activeContact.time}</p>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <div className="bg-brand-primary text-brand-primary-text rounded-2xl rounded-br-md px-4 py-2.5 max-w-[70%]">
                        <p className="text-base">Thank you! I'll check it out.</p>
                        <p className="text-xs opacity-70 mt-1">Just now</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Input */}
                <div className="p-3 border-t border-main-border">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={messageText}
                      onChange={e => setMessageText(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleSend()}
                      placeholder="Type a message..."
                      className="flex-1 bg-main-bg rounded-full px-4 py-2.5 text-base text-main-heading placeholder-slate-400 border border-main-border outline-none focus:ring-2 focus:ring-brand-primary/20"
                    />
                    <button
                      onClick={handleSend}
                      className="p-2.5 bg-brand-primary text-brand-primary-text rounded-full hover:bg-brand-hover transition-colors"
                    >
                      <Send size={18} />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageSquare size={48} className="mx-auto text-slate-300 mb-3" />
                  <p className="text-sm text-slate-500">Select a contact to start messaging.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeMessages;
