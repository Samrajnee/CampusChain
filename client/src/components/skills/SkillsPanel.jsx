import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import {
  getMySkills, getUserSkills, searchSkills,
  addSkill, removeSkill, endorseSkill, removeEndorsement,
} from '../../api/identity';
import SectionLabel from '../ui/SectionLabel';
import Alert from '../ui/Alert';

// ── Endorsers tooltip ─────────────────────────────────────────────────────────

function EndorserList({ endorsements }) {
  if (!endorsements?.length) return null;

  return (
    <div className="flex flex-wrap gap-1 mt-2">
      {endorsements.map((e) => {
        const name = e.endorser?.profile?.firstName
          ? `${e.endorser.profile.firstName} ${e.endorser.profile.lastName}`
          : 'Someone';
        return (
          <span
            key={e.id}
            title={e.note || undefined}
            className="text-xs font-sans px-2 py-0.5 rounded-full"
            style={{
              background: 'var(--surface-2)',
              color: 'var(--text-3)',
              border: '1px solid var(--border)',
            }}
          >
            {name}
            {e.endorser?.role === 'TEACHER' || e.endorser?.role === 'HOD' ? (
              <span style={{ color: '#C9A96E' }}> ·</span>
            ) : null}
          </span>
        );
      })}
    </div>
  );
}

// ── Skill chip ────────────────────────────────────────────────────────────────

function SkillChip({ skill, isOwn, targetUserId, onRemove }) {
  const { user }    = useAuth();
  const qc          = useQueryClient();
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState('');
  const ref = useRef(null);

  const hasEndorsed = skill.endorsements?.some(
    (e) => e.endorser?.id === user?.id
  );

  const endorseMut = useMutation({
    mutationFn: () => endorseSkill(targetUserId, { skillId: skill.id, note }),
    onSuccess: () => {
      qc.invalidateQueries(['skills', targetUserId]);
      setOpen(false);
      setNote('');
    },
  });

  const unendorseMut = useMutation({
    mutationFn: () => removeEndorsement(targetUserId, skill.id),
    onSuccess: () => qc.invalidateQueries(['skills', targetUserId]),
  });

  // Close popover on outside click
  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      {/* Chip */}
      <div
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all duration-150 group"
        style={{
          background: 'var(--white)',
          border: hasEndorsed ? '1px solid #C9A96E' : '1px solid var(--border)',
          boxShadow: '0 1px 2px rgba(11,17,32,0.04)',
        }}
      >
        <span className="text-sm font-sans font-medium" style={{ color: 'var(--text-1)' }}>
          {skill.name}
        </span>

        {/* Endorsement count badge */}
        {skill.endorsementCount > 0 && (
          <span
            className="text-xs font-sans font-semibold px-1.5 py-0.5 rounded-full"
            style={{ background: 'rgba(201,169,110,0.12)', color: '#C9A96E' }}
          >
            {skill.endorsementCount}
          </span>
        )}

        {/* Own profile — remove button */}
        {isOwn && (
          <button
            onClick={() => onRemove(skill.id)}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ color: 'var(--text-4)' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#DC2626')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-4)')}
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24"
              stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        {/* Other user — endorse/unendorse toggle */}
        {!isOwn && user?.id !== targetUserId && (
          <button
            onClick={() => hasEndorsed ? unendorseMut.mutate() : setOpen((o) => !o)}
            className="text-xs font-sans font-semibold transition-colors"
            style={{ color: hasEndorsed ? '#C9A96E' : 'var(--text-4)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = hasEndorsed ? '#B8934A' : '#C9A96E';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = hasEndorsed ? '#C9A96E' : 'var(--text-4)';
            }}
          >
            {hasEndorsed ? 'Endorsed' : 'Endorse'}
          </button>
        )}
      </div>

      {/* Endorsement popover */}
      {open && (
        <div
          className="absolute left-0 top-full mt-2 z-20 w-64 p-4 rounded-xl animate-fade-in"
          style={{
            background: 'var(--white)',
            border: '1px solid var(--border)',
            boxShadow: '0 8px 24px rgba(11,17,32,0.12)',
          }}
        >
          <p className="text-xs font-sans font-semibold text-t1 mb-2">
            Endorse {skill.name}
          </p>
          <textarea
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add a note (optional)..."
            className="w-full px-3 py-2 text-xs font-sans rounded-lg resize-none transition-all duration-150"
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              color: 'var(--text-1)',
              outline: 'none',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#C9A96E';
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(201,169,110,0.15)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          />
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => { setOpen(false); setNote(''); }}
              className="flex-1 py-1.5 text-xs font-sans rounded-lg transition-colors"
              style={{
                background: 'var(--surface-2)',
                color: 'var(--text-3)',
                border: '1px solid var(--border)',
              }}
            >
              Cancel
            </button>
            <button
              onClick={() => endorseMut.mutate()}
              disabled={endorseMut.isPending}
              className="flex-1 py-1.5 text-xs font-sans font-semibold rounded-lg text-white transition-all duration-150"
              style={{
                background: 'linear-gradient(135deg, #C9A96E, #B8934A)',
              }}
            >
              {endorseMut.isPending ? 'Endorsing...' : 'Endorse'}
            </button>
          </div>
        </div>
      )}

      {/* Endorser list below chip */}
      {open && skill.endorsements?.length > 0 && (
        <EndorserList endorsements={skill.endorsements} />
      )}
    </div>
  );
}

// ── Main panel ────────────────────────────────────────────────────────────────

export default function SkillsPanel({ targetUserId, isOwn = false }) {
  const { user } = useAuth();
  const qc       = useQueryClient();
  const [input, setInput]       = useState('');
  const [suggestions, setSugg]  = useState([]);
  const [showSugg, setShowSugg] = useState(false);
  const [error, setError]       = useState('');
  const inputRef = useRef(null);
  const suggRef  = useRef(null);

  const { data, isLoading } = useQuery({
    queryKey: ['skills', targetUserId],
    queryFn:  () => isOwn ? getMySkills() : getUserSkills(targetUserId),
    enabled:  !!targetUserId,
  });

  const skills = data?.data?.skills ?? [];

  // Autocomplete
  useEffect(() => {
    if (!isOwn) return;
    if (input.length < 1) { setSugg([]); return; }

    const t = setTimeout(async () => {
      try {
        const res = await searchSkills(input);
        setSugg(res?.data?.skills ?? []);
        setShowSugg(true);
      } catch { setSugg([]); }
    }, 250);

    return () => clearTimeout(t);
  }, [input, isOwn]);

  // Close suggestions on outside click
  useEffect(() => {
    function handler(e) {
      if (
        inputRef.current && !inputRef.current.contains(e.target) &&
        suggRef.current  && !suggRef.current.contains(e.target)
      ) {
        setShowSugg(false);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const addMut = useMutation({
    mutationFn: (name) => addSkill(name),
    onSuccess: () => {
      qc.invalidateQueries(['skills', targetUserId]);
      setInput('');
      setSugg([]);
      setShowSugg(false);
    },
    onError: (e) => setError(e.response?.data?.message || 'Failed to add skill'),
  });

  const removeMut = useMutation({
    mutationFn: (skillId) => removeSkill(skillId),
    onSuccess: () => qc.invalidateQueries(['skills', targetUserId]),
  });

  function handleAdd(name) {
    const val = (name ?? input).trim();
    if (!val) return;
    setError('');
    addMut.mutate(val);
  }

  return (
    <div>
      <SectionLabel>Skills</SectionLabel>

      <Alert type="error" message={error} />

      {/* Add skill input — own profile only */}
      {isOwn && (
        <div className="relative mb-4">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => { setInput(e.target.value); setError(''); }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') { e.preventDefault(); handleAdd(); }
                  if (e.key === 'Escape') { setShowSugg(false); }
                }}
                onFocus={() => input.length > 0 && setShowSugg(true)}
                placeholder="Add a skill (e.g. React, Python, Leadership)"
                className="w-full px-4 py-2.5 text-sm font-sans rounded-lg transition-all duration-150"
                style={{
                  background: 'var(--white)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-1)',
                  outline: 'none',
                }}
                onFocusCapture={(e) => {
                  e.currentTarget.style.borderColor = '#C9A96E';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(201,169,110,0.2)';
                }}
                onBlurCapture={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />

              {/* Suggestions dropdown */}
              {showSugg && suggestions.length > 0 && (
                <div
                  ref={suggRef}
                  className="absolute left-0 top-full mt-1 w-full z-20 rounded-xl overflow-hidden"
                  style={{
                    background: 'var(--white)',
                    border: '1px solid var(--border)',
                    boxShadow: '0 8px 24px rgba(11,17,32,0.10)',
                  }}
                >
                  {suggestions.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => handleAdd(s.name)}
                      className="w-full text-left px-4 py-2.5 text-sm font-sans transition-colors"
                      style={{ color: 'var(--text-2)' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'var(--surface-2)';
                        e.currentTarget.style.color = 'var(--text-1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = 'var(--text-2)';
                      }}
                    >
                      {s.name}
                    </button>
                  ))}
                  {/* Add as new if not in list */}
                  {!suggestions.find(
                    (s) => s.name.toLowerCase() === input.toLowerCase()
                  ) && (
                    <button
                      onClick={() => handleAdd(input)}
                      className="w-full text-left px-4 py-2.5 text-sm font-sans transition-colors"
                      style={{ color: '#C9A96E' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-2)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      Add "{input}"
                    </button>
                  )}
                </div>
              )}
            </div>

            <button
              onClick={() => handleAdd()}
              disabled={!input.trim() || addMut.isPending}
              className="px-4 py-2.5 rounded-lg text-sm font-sans font-semibold text-white transition-all duration-150 disabled:opacity-40"
              style={{
                background: 'linear-gradient(135deg, #C9A96E, #B8934A)',
              }}
            >
              {addMut.isPending ? '...' : 'Add'}
            </button>
          </div>
        </div>
      )}

      {/* Skill chips */}
      {isLoading ? (
        <div className="flex gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-8 rounded-xl" style={{ width: `${60 + i * 20}px` }} />
          ))}
        </div>
      ) : skills.length === 0 ? (
        <p className="text-sm font-sans" style={{ color: 'var(--text-4)' }}>
          {isOwn
            ? 'Add your first skill above'
            : 'No skills added yet'}
        </p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {skills.map((skill) => (
            <SkillChip
              key={skill.id}
              skill={skill}
              isOwn={isOwn}
              targetUserId={targetUserId}
              onRemove={(id) => removeMut.mutate(id)}
            />
          ))}
        </div>
      )}

      {/* Hint for other users */}
      {!isOwn && user?.id !== targetUserId && skills.length > 0 && (
        <p className="text-xs font-sans mt-3" style={{ color: 'var(--text-4)' }}>
          Click Endorse on any skill to vouch for this student
        </p>
      )}
    </div>
  );
}