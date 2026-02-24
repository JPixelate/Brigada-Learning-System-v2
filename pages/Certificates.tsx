import React, { useState } from 'react';
import { Award, Download, Eye, Plus, ChevronLeft, Save, Layout, Type, Briefcase, PenTool, Upload, Trash2, X, Ruler } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { CertificateContent, CertificateScaler, CertificateThumbnail } from '../components/CertificateRenderer';
import { CertificateTemplate, Signatory } from '../types';
import { useData } from '../context/DataContext';

const Certificates = () => {
  const { data: db, updateCertificate } = useData();
  const [isDesigning, setIsDesigning] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<CertificateTemplate | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showDimensions, setShowDimensions] = useState(false);

  const certificates: CertificateTemplate[] = db.certificates;
  const businessUnits = db.commonData.departments;
  const moduleTypes = ["Technical", "Compliance", "Leadership", "Sales", "Soft Skills", "Safety"];

  const handleEdit = (cert: CertificateTemplate) => {
    const certWithSignatories = {
      ...cert,
      signatories: cert.signatories || (cert.signatoryName ? [{ name: cert.signatoryName, title: cert.signatoryTitle || '' }] : [])
    };
    setSelectedTemplate(certWithSignatories);
    setIsDesigning(true);
  };

  const handleSave = () => {
    if (selectedTemplate) {
      updateCertificate(selectedTemplate.id, selectedTemplate);
      setIsDesigning(false);
    }
  };

  const addSignatory = () => {
    if (!selectedTemplate) return;
    const currentSignatories = selectedTemplate.signatories || [];
    if (currentSignatories.length >= 4) return;

    setSelectedTemplate({
      ...selectedTemplate,
      signatories: [...currentSignatories, { name: "", title: "" }]
    });
  };

  const removeSignatory = (index: number) => {
    if (!selectedTemplate) return;
    const currentSignatories = selectedTemplate.signatories || [];
    setSelectedTemplate({
      ...selectedTemplate,
      signatories: currentSignatories.filter((_, i) => i !== index)
    });
  };

  const updateSignatory = (index: number, field: 'name' | 'title', value: string) => {
    if (!selectedTemplate) return;
    const currentSignatories = selectedTemplate.signatories || [];
    const updated = [...currentSignatories];
    updated[index] = { ...updated[index], [field]: value };
    setSelectedTemplate({
      ...selectedTemplate,
      signatories: updated
    });
  };

  // ─── Design Editor ───
  if (isDesigning && selectedTemplate) {
    const widthInches = 11.69;
    const heightInches = 8.27;

    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsDesigning(false)}
              className="p-2 text-slate-400 hover:text-main-heading hover:bg-main-bg rounded-full transition-colors border border-transparent hover:border-main-border"
            >
              <ChevronLeft size={20} />
            </button>

            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className="flex items-center gap-1.5 bg-brand-primary text-brand-primary-text px-5 py-2 rounded-full font-bold text-xs shadow-sm hover:bg-brand-hover transition-all active:scale-95"
              >
                <Save size={14} />
                Save Design
              </button>
              <button
                onClick={() => setShowPreview(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-main-border text-main-text font-bold text-xs hover:bg-main-bg transition-all bg-main-surface shadow-sm"
              >
                <Eye size={14} />
                Full Preview
              </button>
              <button
                onClick={() => setShowDimensions(!showDimensions)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full border text-xs font-bold transition-all shadow-sm ${
                  showDimensions
                    ? 'border-brand-primary bg-brand-primary/5 text-brand-primary'
                    : 'border-main-border text-main-text hover:bg-main-bg bg-main-surface'
                }`}
              >
                <Ruler size={14} />
                Dimensions
              </button>
            </div>
          </div>

          <span className="px-2.5 py-1 bg-main-bg text-slate-500 text-[10px] font-bold uppercase tracking-wider rounded-full border border-main-border transition-colors">Editor</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-main-surface p-6 rounded-xl border border-main-border shadow-sm space-y-6 transition-colors font-bold">
              <h3 className="text-sm font-bold text-main-heading uppercase tracking-widest flex items-center gap-2">
                <Layout size={16} className="text-slate-400" /> General Settings
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Certificate Name</label>
                  <input
                    type="text"
                    value={selectedTemplate.name}
                    onChange={(e) => setSelectedTemplate({...selectedTemplate, name: e.target.value})}
                    className="w-full px-4 py-2.5 bg-main-bg border border-main-border rounded-lg text-sm font-semibold focus:ring-2 focus:ring-brand-primary/5 focus:border-brand-primary outline-none transition-all text-main-heading"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Primary Color</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={selectedTemplate.primaryColor}
                        onChange={(e) => setSelectedTemplate({...selectedTemplate, primaryColor: e.target.value})}
                        className="w-10 h-10 border-none bg-transparent cursor-pointer"
                      />
                      <input
                        type="text"
                        value={selectedTemplate.primaryColor}
                        onChange={(e) => setSelectedTemplate({...selectedTemplate, primaryColor: e.target.value})}
                        className="flex-1 px-3 py-2 bg-main-bg border border-main-border rounded-lg text-xs font-mono text-main-text outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Template Style</label>
                    <select
                      value={selectedTemplate.template}
                      onChange={(e) => setSelectedTemplate({...selectedTemplate, template: e.target.value})}
                      className="w-full px-3 py-2.5 bg-main-bg border border-main-border rounded-lg text-sm font-semibold focus:border-brand-primary outline-none transition-all text-main-heading"
                    >
                      <option>Modern Blue</option>
                      <option>Corporate Gold</option>
                      <option>Executive Dark</option>
                      <option>Minimalist</option>
                      <option>Universal Premium</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex justify-between">
                    <span>Background Image (WEBP/PNG)</span>
                    <span className="text-[9px] font-black text-slate-400">11.69" x 8.27"</span>
                  </label>
                  {!selectedTemplate.backgroundImage ? (
                    <div
                      onClick={() => document.getElementById('bg-upload')?.click()}
                      className="group relative h-24 border-2 border-dashed border-main-border rounded-xl flex flex-col items-center justify-center gap-2 hover:border-brand-primary hover:bg-main-bg transition-all cursor-pointer overflow-hidden"
                    >
                      <Upload size={20} className="text-slate-300 group-hover:text-brand-primary" />
                      <p className="text-[10px] font-bold text-slate-400 group-hover:text-main-heading">Upload Custom Design</p>
                      <input
                        id="bg-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              setSelectedTemplate({...selectedTemplate, backgroundImage: event.target?.result as string});
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </div>
                  ) : (
                    <div className="relative group rounded-xl overflow-hidden border border-main-border aspect-[1.414/1]">
                      <img src={selectedTemplate.backgroundImage} className="w-full h-full object-cover" alt="Preview"/>
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-all">
                        <button
                          onClick={() => document.getElementById('bg-upload-change')?.click()}
                          className="p-2 bg-white text-brand-primary rounded-lg hover:bg-brand-primary hover:text-white transition-all shadow-lg"
                        >
                          <PenTool size={16} />
                        </button>
                        <button
                          onClick={() => setSelectedTemplate({...selectedTemplate, backgroundImage: undefined})}
                          className="p-2 bg-white text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all shadow-lg"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <input
                        id="bg-upload-change"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              setSelectedTemplate({...selectedTemplate, backgroundImage: event.target?.result as string});
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-main-surface p-6 rounded-xl border border-main-border shadow-sm space-y-6 transition-colors">
              <h3 className="text-sm font-bold text-main-heading uppercase tracking-widest flex items-center gap-2">
                <Briefcase size={16} className="text-slate-400" /> Organization Mapping
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Business Unit / Department</label>
                  <select
                    value={selectedTemplate.businessUnit}
                    onChange={(e) => setSelectedTemplate({...selectedTemplate, businessUnit: e.target.value})}
                    className="w-full px-4 py-2.5 bg-main-bg border border-main-border rounded-lg text-sm font-semibold focus:border-brand-primary outline-none transition-all text-main-heading"
                  >
                    <option>All Units</option>
                    {businessUnits.map(unit => <option key={unit}>{unit}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Module Category</label>
                  <select
                    value={selectedTemplate.moduleType}
                    onChange={(e) => setSelectedTemplate({...selectedTemplate, moduleType: e.target.value})}
                    className="w-full px-4 py-2.5 bg-main-bg border border-main-border rounded-lg text-sm font-semibold focus:border-brand-primary outline-none transition-all text-main-heading"
                  >
                    <option>General</option>
                    {moduleTypes.map(type => <option key={type}>{type}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-main-surface p-6 rounded-xl border border-main-border shadow-sm space-y-6 transition-colors">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-main-heading uppercase tracking-widest flex items-center gap-2">
                  <Type size={16} className="text-slate-400" /> Signatories
                </h3>
                <span className="text-[10px] font-bold text-slate-400">{(selectedTemplate.signatories || []).length}/4</span>
              </div>

              <div className="space-y-3">
                {(selectedTemplate.signatories || []).map((sig, idx) => (
                  <div key={idx} className="p-3 bg-main-bg rounded-lg border border-main-border space-y-2">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Signatory {idx + 1}</span>
                      <button
                        onClick={() => removeSignatory(idx)}
                        className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      >
                        <X size={12} />
                      </button>
                    </div>
                    <input
                      type="text"
                      value={sig.name}
                      onChange={(e) => updateSignatory(idx, 'name', e.target.value)}
                      placeholder="Name"
                      className="w-full px-3 py-2 bg-main-surface border border-main-border rounded-lg text-xs font-semibold focus:border-brand-primary outline-none transition-all text-main-heading placeholder:font-medium placeholder:text-[11px] placeholder:text-slate-400/60"
                    />
                    <input
                      type="text"
                      value={sig.title}
                      onChange={(e) => updateSignatory(idx, 'title', e.target.value)}
                      placeholder="Title"
                      className="w-full px-3 py-2 bg-main-surface border border-main-border rounded-lg text-xs font-semibold focus:border-brand-primary outline-none transition-all text-main-heading placeholder:font-medium placeholder:text-[11px] placeholder:text-slate-400/60"
                    />
                  </div>
                ))}

                {(selectedTemplate.signatories || []).length < 4 && (
                  <button
                    onClick={addSignatory}
                    className="w-full py-2 border-2 border-dashed border-main-border rounded-lg text-xs font-bold text-slate-400 hover:text-main-heading hover:border-brand-primary transition-all flex items-center justify-center gap-2"
                  >
                    <Plus size={14} />
                    Add Signatory
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Visual Preview — auto-scaled to fill available space */}
          <div className="lg:col-span-8">
            <div className="bg-main-bg rounded-xl border-2 border-dashed border-main-border p-6 flex flex-col items-center justify-center sticky top-24 transition-colors relative overflow-hidden">
              {/* Grid Overlay */}
              <div className="absolute inset-0 z-0 pointer-events-none p-6">
                <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(148, 163, 184, 0.15)" strokeWidth="0.5"/>
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>
              </div>

              {/* Certificate — auto-scaled */}
              <div className="relative z-10 w-full">
                <CertificateScaler>
                  <CertificateContent
                    cert={selectedTemplate}
                    systemName={db.systemBranding.name}
                    completionHours="40/40 hours"
                  />
                </CertificateScaler>

                {/* Dimension Indicators */}
                {showDimensions && (
                  <div className="flex justify-center mt-4">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <div className="h-px bg-slate-400 w-8 border-l-2 border-slate-500" />
                        <div className="px-2 py-0.5 bg-slate-100 rounded text-[10px] font-bold text-slate-600 flex items-center gap-1 border border-slate-300">
                          <Ruler size={10} />
                          {widthInches.toFixed(2)}"
                        </div>
                        <div className="h-px bg-slate-400 w-8 border-r-2 border-slate-500" />
                      </div>
                      <span className="text-slate-300">×</span>
                      <div className="flex items-center gap-2">
                        <div className="h-px bg-slate-400 w-8 border-l-2 border-slate-500" />
                        <div className="px-2 py-0.5 bg-slate-100 rounded text-[10px] font-bold text-slate-600 flex items-center gap-1 border border-slate-300">
                          <Ruler size={10} />
                          {heightInches.toFixed(2)}"
                        </div>
                        <div className="h-px bg-slate-400 w-8 border-r-2 border-slate-500" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Full-screen Preview Modal */}
        {showPreview && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="bg-main-surface rounded-2xl border border-main-border shadow-2xl w-full max-w-[1200px] max-h-[95vh] overflow-auto">
              <div className="sticky top-0 bg-main-surface border-b border-main-border p-4 flex items-center justify-between z-10">
                <h3 className="text-lg font-bold text-main-heading">Certificate Preview</h3>
                <button
                  onClick={() => setShowPreview(false)}
                  className="p-2 text-slate-400 hover:text-main-heading hover:bg-main-bg rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-6">
                <CertificateScaler>
                  <CertificateContent
                    cert={selectedTemplate}
                    systemName={db.systemBranding.name}
                    completionHours="40/40 hours"
                  />
                </CertificateScaler>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ─── Certificate List ───
  return (
    <div className="relative space-y-4 animate-in fade-in duration-500">
      <PageHeader
        title="Certificate Designer"
        description="Manage the universal certificate template used across the entire platform."
        icon={PenTool}
        stats={[
          { label: 'Universal Templates', value: certificates.length },
          { label: 'Total Issued', value: certificates.reduce((acc, c) => acc + (c.issued || 0), 0).toLocaleString() }
        ]}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {certificates.map(cert => {
          return (
            <div key={cert.id} className="group bg-main-surface rounded-xl border border-main-border shadow-sm overflow-hidden hover:shadow-md transition-all">
              {/* Certificate Thumbnail */}
              <div className="bg-main-bg p-4 flex items-center justify-center relative group transition-colors overflow-hidden border-b border-main-border">
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-brand-primary/40 backdrop-blur-[1px] flex items-center justify-center gap-3 transition-opacity z-10"
                >
                  <button onClick={() => handleEdit(cert)} className="p-2.5 bg-brand-primary-text text-brand-primary rounded-full hover:bg-main-bg transition-colors shadow-lg"><Eye size={20} /></button>
                  <button onClick={() => handleEdit(cert)} className="p-2.5 bg-brand-primary-text text-brand-primary rounded-full hover:bg-main-bg transition-colors shadow-lg"><PenTool size={16} /></button>
                </div>
                <CertificateThumbnail
                  cert={cert}
                  systemName={db.systemBranding.name}
                  completionHours="40/40 hours"
                  scale={0.26}
                />
              </div>

              <div className="p-5">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-sm font-bold text-main-heading leading-tight">{cert.name}</h3>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1.5 py-0.5 bg-main-bg rounded border border-main-border transition-colors">{cert.moduleType}</span>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                    <Briefcase size={14} className="text-slate-300" />
                    <span>Mapped to: <span className="text-main-heading font-semibold">{cert.businessUnit}</span></span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                    <Award size={14} className="text-slate-300" />
                    <span>Issued: <span className="text-main-heading font-semibold">{(cert.issued || 0).toLocaleString()}</span></span>
                  </div>
                </div>

                <div className="flex gap-2 border-t border-main-border pt-4">
                  <button
                    onClick={() => handleEdit(cert)}
                    className="flex-1 px-4 py-2 bg-main-bg hover:bg-brand-primary hover:text-brand-primary-text text-main-text rounded-lg text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2"
                  >
                    <PenTool size={14} />
                    Edit Universal Design
                  </button>
                  <button className="p-2 text-slate-400 hover:text-main-heading transition-colors">
                    <Download size={16} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Certificates;
