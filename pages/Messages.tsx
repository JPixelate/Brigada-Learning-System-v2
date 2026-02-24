import React, { useState } from 'react';
import { Search, Send, Paperclip, MoreVertical, Phone, Video } from 'lucide-react';
import { DBStructure, Contact, Message } from '../types';
import { useData } from '../context/DataContext';

const Messages = () => {
  const { data: db, sendMessage } = useData();
  const contacts: Contact[] = db.contacts;
  const [selectedContact, setSelectedContact] = useState<Contact>(contacts[0]);
  const [msgInput, setMsgInput] = useState('');

  // Fixed sender ID for now (usually comes from AuthContext)
  const currentUserId = 'admin-1';

  // Filter messages between current user and selected contact
  const chatMessages = (db.messages || []).filter(m => 
    (m.senderId === currentUserId && m.receiverId === selectedContact.id) ||
    (m.senderId === selectedContact.id && m.receiverId === currentUserId)
  );

  const handleSendMessage = () => {
    if (!msgInput.trim()) return;
    
    sendMessage({
      senderId: currentUserId,
      receiverId: selectedContact.id,
      content: msgInput,
      timestamp: new Date().toISOString(),
      read: false
    });
    
    setMsgInput('');
  };

  return (
    <div className="relative h-[calc(100vh-8rem)] bg-main-surface rounded-lg border border-main-border shadow-sm overflow-hidden flex transition-colors">
      {/* Sidebar List */}
      <div className="w-96 border-r border-main-border flex flex-col bg-main-surface transition-colors">
        <div className="p-4">
          <h2 className="text-lg font-bold text-main-heading mb-4">Messages</h2>
          <div className="relative">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
             <input type="text" placeholder="Search chats..." className="w-full pl-10 pr-3 py-2.5 bg-main-bg rounded-full text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-primary/5 text-main-heading border border-main-border transition-all" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-1">
            {contacts.map(contact => (
                <div 
                    key={contact.id} 
                    onClick={() => setSelectedContact(contact)}
                    className={`p-3 flex gap-4 cursor-pointer rounded-xl transition-all ${selectedContact.id === contact.id ? 'bg-main-bg text-main-heading border border-main-border' : 'hover:bg-main-bg'}`}
                >
                    <div className="relative">
                        <img src={contact.avatar} alt="" className="w-12 h-12 rounded-full object-cover shadow-sm border border-slate-200" />
                        {contact.id === '1' && <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline mb-1">
                            <h4 className="font-bold text-main-heading text-sm truncate">{contact.name}</h4>
                            <span className="text-xs font-medium text-slate-500">{contact.time}</span>
                        </div>
                        <p className={`text-sm truncate ${contact.unread > 0 ? 'text-main-heading font-bold' : 'text-main-text font-medium'}`}>{contact.lastMsg}</p>
                    </div>
                </div>
            ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-main-bg/30 transition-colors">
        <div className="p-4 border-b border-main-border flex justify-between items-center bg-main-surface shadow-sm z-10 transition-colors">
            <div className="flex items-center gap-4">
                <img src={selectedContact.avatar} alt="" className="w-10 h-10 rounded-full object-cover shadow-sm border border-main-border" />
                <div>
                    <h3 className="font-bold text-main-heading text-base">{selectedContact.name}</h3>
                    <span className="text-xs text-green-600 font-bold flex items-center gap-1.5">● Active Now</span>
                </div>
            </div>
            <div className="flex gap-3">
                <button className="p-2.5 bg-main-bg text-main-text rounded-full hover:bg-main-border transition-colors"><Phone size={18} /></button>
                <button className="p-2.5 bg-main-bg text-main-text rounded-full hover:bg-main-border transition-colors"><Video size={18} /></button>
                <button className="p-2.5 bg-transparent text-slate-400 rounded-full hover:bg-main-bg transition-colors"><MoreVertical size={18} /></button>
            </div>
        </div>

        <div className="flex-1 p-6 overflow-y-auto space-y-4">
            <div className="flex justify-center">
                <span className="text-xs font-bold text-main-text bg-main-bg px-4 py-1.5 rounded-full border border-main-border shadow-sm transition-colors">Chat Session Started</span>
            </div>
            
            {chatMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full opacity-40">
                <Send size={48} className="mb-4" />
                <p className="font-bold">No messages yet. Start the conversation!</p>
              </div>
            ) : (
              chatMessages.map(msg => (
                <div key={msg.id} className={`flex gap-4 ${msg.senderId === currentUserId ? 'flex-row-reverse' : ''}`}>
                    <img 
                      src={msg.senderId === currentUserId ? db.currentUser.avatar : selectedContact.avatar} 
                      className="w-9 h-9 rounded-full self-end shadow-sm" 
                      alt="" 
                    />
                    <div className={`p-4 rounded-xl shadow-sm border text-sm font-bold leading-relaxed transition-colors max-w-md ${
                      msg.senderId === currentUserId 
                        ? 'bg-brand-primary text-brand-primary-text border-brand-primary rounded-br-none' 
                        : 'bg-main-surface text-main-heading border-main-border rounded-bl-none'
                    }`}>
                        {msg.content}
                    </div>
                </div>
              ))
            )}
        </div>

        <div className="p-4 bg-main-surface border-t border-main-border transition-colors">
            <div className="flex gap-3 items-center bg-main-bg rounded-full px-3 py-2 border border-main-border transition-colors">
                <button className="p-2 text-slate-400 hover:text-main-heading bg-transparent rounded-full transition-colors">
                    <Paperclip size={20} />
                </button>
                <input 
                    type="text" 
                    value={msgInput}
                    onChange={(e) => setMsgInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type a message..." 
                    className="flex-1 bg-transparent border-none focus:ring-0 text-main-heading font-bold placeholder-slate-400 text-sm"
                />
                <button 
                  onClick={handleSendMessage}
                  className="p-3 bg-brand-primary text-brand-primary-text rounded-full hover:bg-brand-hover shadow-md transition-all active:scale-95"
                >
                    <Send size={18} />
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;