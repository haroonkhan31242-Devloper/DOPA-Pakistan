import React, { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Heart,
  Lock,
  MessageSquare,
  Pin,
  Play,
  Plus,
  Share2,
  Video as VideoIcon,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { PostType } from '../types';
import { AuthGate, EmptyState, FileUpload, Modal, PageHeader, StatusBadge } from '../components/ui';
import { formatDateShort, getYoutubeEmbedUrl } from '../lib/formatters';

/* ================= M14 COMMUNITY (/community/ & /community/post/:id) ================= */
export const CommunityPage: React.FC = () => {
  const { id: postIdParam } = useParams<{ id?: string }>();
  const {
    currentUser,
    currentPharmacy,
    isActiveDopaMember,
    posts,
    createPost,
    toggleLikePost,
    addComment,
    pushToast,
  } = useApp();

  const activeUserId = currentUser?.id || currentPharmacy?.id || '';
  const isSignedIn = Boolean(currentUser || currentPharmacy);

  const [filterTab, setFilterTab] = useState<'All' | PostType | 'Members-only'>('All');
  const [modalOpen, setModalOpen] = useState(false);
  const [postType, setPostType] = useState<PostType>('Post');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [imgName, setImgName] = useState('');
  const [imgData, setImgData] = useState('');
  const [membersOnly, setMembersOnly] = useState(false);
  const [commentText, setCommentText] = useState('');

  const approvedPosts = useMemo(() => {
    const list = posts.filter((p) => p.status === 'Approved');
    return [...list].sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return b.createdAt.localeCompare(a.createdAt);
    });
  }, [posts]);

  const filteredPosts = useMemo(() => {
    return approvedPosts.filter((p) => {
      if (filterTab === 'Members-only') return p.membersOnly;
      if (filterTab !== 'All' && p.type !== filterTab) return false;
      return true;
    });
  }, [approvedPosts, filterTab]);

  if (!isSignedIn) {
    return (
      <div className="py-12">
        <div className="wrap">
          <AuthGate
            title="Pharm.D & DOPA Community"
            message="Sign in with a free Pharm.D account or Pharmacy account to read discussions, ask clinical questions, and share posts."
            redirectTo={postIdParam ? `/community/post/${postIdParam}` : '/community/'}
          />
        </div>
      </div>
    );
  }

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim()) {
      pushToast('Please enter post content.', 'bad');
      return;
    }
    const authorName = currentUser?.name || currentPharmacy?.name || 'Member';
    const authorRoleLabel = currentPharmacy
      ? `Pharmacy · ${currentPharmacy.city}`
      : isActiveDopaMember
      ? `DOPA Member · ${currentUser?.city || ''}`
      : `${currentUser?.qualification || 'User'} · ${currentUser?.city || ''}`;

    createPost({
      authorId: activeUserId,
      authorName,
      authorRoleLabel,
      type: postType,
      title: title.trim() || undefined,
      body: body.trim(),
      image: imgData || undefined,
      videoUrl: videoUrl.trim() || undefined,
      membersOnly: isActiveDopaMember ? membersOnly : false,
    });
    setTitle('');
    setBody('');
    setVideoUrl('');
    setImgName('');
    setImgData('');
    setMembersOnly(false);
    setModalOpen(false);
  };

  // Single post detail view
  if (postIdParam) {
    const post = approvedPosts.find((p) => p.id === postIdParam);
    if (!post) {
      return (
        <div className="py-12">
          <div className="wrap">
            <EmptyState
              icon={<MessageSquare className="w-6 h-6" />}
              title="Post not found"
              action={
                <Link to="/community/" className="dopa-btn primary">
                  Back to community
                </Link>
              }
            />
          </div>
        </div>
      );
    }

    const locked = post.membersOnly && !isActiveDopaMember;
    const liked = post.likes.includes(activeUserId);

    return (
      <div>
        <PageHeader
          crumbs={[
            { label: 'Home', to: '/' },
            { label: 'Community', to: '/community/' },
            { label: post.title || post.type },
          ]}
          eyebrow={post.type}
          title={post.title || `${post.authorName}'s ${post.type}`}
          actions={
            <Link to="/community/" className="dopa-btn sm ghost">
              <ArrowLeft className="w-4 h-4" /> Back to feed
            </Link>
          }
        />

        <section className="pb-12">
          <div className="wrap max-w-3xl flex flex-col gap-6">
            <article className="dopa-card flex flex-col gap-4">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--muted)]">
                <div>
                  <span className="font-bold text-sm text-[var(--fg)]">{post.authorName}</span> ·{' '}
                  {post.authorRoleLabel} · {formatDateShort(post.createdAt)}
                </div>
                {post.membersOnly && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-[var(--warnbg)] text-[var(--warn)] font-semibold">
                    <Lock className="w-3 h-3" /> DOPA Members Only
                  </span>
                )}
              </div>

              {locked ? (
                <div className="p-6 rounded-xl bg-[var(--surface2)] text-center flex flex-col items-center gap-3">
                  <Lock className="w-6 h-6 text-[var(--accent)]" />
                  <p className="text-sm text-[var(--muted)]">
                    This discussion is restricted to verified DOPA Association members.
                  </p>
                  <Link to="/dopa-association/" className="dopa-btn sm primary">
                    Join DOPA Association (Free)
                  </Link>
                </div>
              ) : (
                <>
                  <p className="leading-relaxed whitespace-pre-line">{post.body}</p>
                  {post.image && (
                    <img
                      src={post.image}
                      alt={post.title || 'Post attachment'}
                      className="rounded-xl border border-[var(--line)] max-h-96 object-cover"
                    />
                  )}
                  <div className="flex items-center gap-3 pt-3 border-t border-[var(--line)]">
                    <button
                      type="button"
                      onClick={() => toggleLikePost(post.id)}
                      className={`dopa-btn sm ${liked ? 'primary' : 'ghost'}`}
                    >
                      <Heart className="w-4 h-4" /> {post.likes.length} Likes
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard?.writeText(window.location.href).catch(() => {});
                        pushToast('Post link copied.', 'info');
                      }}
                      className="dopa-btn sm ghost"
                    >
                      <Share2 className="w-4 h-4" /> Share
                    </button>
                  </div>
                </>
              )}
            </article>

            {!locked && (
              <div className="dopa-card flex flex-col gap-4">
                <h3>Comments ({post.comments.length})</h3>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!commentText.trim()) return;
                    addComment(post.id, commentText.trim());
                    setCommentText('');
                  }}
                  className="flex flex-col sm:flex-row gap-2"
                >
                  <input
                    type="text"
                    className="dopa-input flex-1"
                    placeholder="Write a helpful comment..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                  />
                  <button type="submit" className="dopa-btn sm primary">
                    Post comment
                  </button>
                </form>

                {post.comments.length === 0 ? (
                  <p className="text-sm text-[var(--muted)]">No comments yet. Start the discussion.</p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {post.comments.map((c) => (
                      <div key={c.id} className="p-3.5 rounded-xl bg-[var(--surface2)]">
                        <div className="text-xs text-[var(--muted)] mb-1">
                          <b className="text-[var(--fg)]">{c.authorName}</b> · {c.authorRoleLabel} ·{' '}
                          {formatDateShort(c.createdAt)}
                        </div>
                        <p className="text-sm">{c.body}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Community' }]}
        eyebrow="Pharmacist Forum"
        title="Community feed"
        intro="Ask clinical questions, discuss DRAP & career updates, and share pharmacy resources with fellow professionals."
        actions={
          <button type="button" onClick={() => setModalOpen(true)} className="dopa-btn primary">
            <Plus className="w-4 h-4" /> Create post
          </button>
        }
      />

      <section className="pb-12">
        <div className="wrap max-w-4xl flex flex-col gap-5">
          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-2">
            {(['All', 'Post', 'Question', 'Article', 'Video link', 'Members-only'] as const).map(
              (t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setFilterTab(t)}
                  className={`dopa-btn sm ${filterTab === t ? 'primary' : 'ghost'}`}
                >
                  {t}
                </button>
              )
            )}
          </div>

          {filteredPosts.length === 0 ? (
            <EmptyState
              icon={<MessageSquare className="w-6 h-6" />}
              title="No posts in this view"
              description="Be the first to share a question, post, or resource."
            />
          ) : (
            <div className="flex flex-col gap-4">
              {filteredPosts.map((post) => {
                const locked = post.membersOnly && !isActiveDopaMember;
                const liked = post.likes.includes(activeUserId);

                return (
                  <article key={post.id} className="dopa-card flex flex-col gap-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="font-semibold px-2.5 py-0.5 rounded-md bg-[var(--surface2)] text-[var(--accent)]">
                          {post.type}
                        </span>
                        {post.pinned && (
                          <span className="inline-flex items-center gap-1 text-[var(--accent)] font-semibold">
                            <Pin className="w-3.5 h-3.5" /> Pinned
                          </span>
                        )}
                        {post.membersOnly && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[var(--warnbg)] text-[var(--warn)] font-semibold">
                            <Lock className="w-3 h-3" /> DOPA Members
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-[var(--muted)]">
                        {formatDateShort(post.createdAt)}
                      </span>
                    </div>

                    <div>
                      <div className="text-xs text-[var(--muted)] mb-1">
                        <b className="text-[var(--fg)]">{post.authorName}</b> · {post.authorRoleLabel}
                      </div>
                      {post.title && (
                        <h3 className="text-lg font-bold mb-1">
                          <Link
                            to={`/community/post/${post.id}`}
                            className="text-[var(--fg)] hover:text-[var(--accent)] no-underline"
                          >
                            {post.title}
                          </Link>
                        </h3>
                      )}
                      {locked ? (
                        <div className="p-4 rounded-xl bg-[var(--surface2)] flex flex-wrap items-center justify-between gap-3">
                          <span className="text-sm text-[var(--muted)] flex items-center gap-2">
                            <Lock className="w-4 h-4 text-[var(--accent)]" />
                            Visible to verified DOPA Association members only.
                          </span>
                          <Link to="/dopa-association/" className="dopa-btn sm primary">
                            Join DOPA
                          </Link>
                        </div>
                      ) : (
                        <p className="text-sm text-[var(--muted)] line-clamp-3">{post.body}</p>
                      )}
                    </div>

                    {!locked && (
                      <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-[var(--line)]">
                        <button
                          type="button"
                          onClick={() => toggleLikePost(post.id)}
                          className={`dopa-btn sm ${liked ? 'primary' : 'ghost'}`}
                        >
                          <Heart className="w-3.5 h-3.5" /> {post.likes.length}
                        </button>
                        <Link to={`/community/post/${post.id}`} className="dopa-btn sm ghost">
                          <MessageSquare className="w-3.5 h-3.5" /> {post.comments.length} Comments
                        </Link>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Create community post">
        <form onSubmit={handleCreatePost} className="flex flex-col gap-3.5">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold">Post type</label>
            <select
              className="dopa-input"
              value={postType}
              onChange={(e) => setPostType(e.target.value as PostType)}
            >
              <option value="Post">Post</option>
              <option value="Question">Question</option>
              <option value="Article">Article</option>
              <option value="Video link">Video link</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold">Title (optional)</label>
            <input
              type="text"
              className="dopa-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold">Content *</label>
            <textarea
              rows={4}
              className="dopa-input"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              required
            />
          </div>
          {postType === 'Video link' && (
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold">YouTube URL</label>
              <input
                type="url"
                className="dopa-input"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
              />
            </div>
          )}
          <FileUpload
            id="postImg"
            label="Attach image (optional)"
            accept=".jpg,.jpeg,.png,.webp"
            fileName={imgName}
            fileData={imgData}
            onFileSelect={(n, d) => {
              setImgName(n);
              setImgData(d);
            }}
            onClear={() => {
              setImgName('');
              setImgData('');
            }}
          />
          {isActiveDopaMember && (
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={membersOnly}
                onChange={(e) => setMembersOnly(e.target.checked)}
              />
              <span>Visible to DOPA members only</span>
            </label>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="dopa-btn sm ghost">
              Cancel
            </button>
            <button type="submit" className="dopa-btn sm primary">
              Publish post
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

/* ================= M15 VIDEOS (/videos/ & /videos/:id) ================= */
export const VideosPage: React.FC = () => {
  const { id: videoIdParam } = useParams<{ id?: string }>();
  const { currentUser, currentPharmacy, isActiveDopaMember, videos, shareVideo, pushToast } =
    useApp();

  const isSignedIn = Boolean(currentUser || currentPharmacy);
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [membersOnly, setMembersOnly] = useState(false);

  const approvedVideos = useMemo(
    () => videos.filter((v) => v.status === 'Approved'),
    [videos]
  );

  if (!isSignedIn) {
    return (
      <div className="py-12">
        <div className="wrap">
          <AuthGate
            title="Educational Pharmacy Videos"
            message="Sign in with a free Pharm.D account to watch lectures, regulatory briefings, and hospital pharmacy tutorials."
            redirectTo={videoIdParam ? `/videos/${videoIdParam}` : '/videos/'}
          />
        </div>
      </div>
    );
  }

  const handleShareVideo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) {
      pushToast('Title and video link are required.', 'bad');
      return;
    }
    shareVideo({
      title: title.trim(),
      description: description.trim() || 'Shared by community member.',
      sourceType: 'youtube',
      url: url.trim(),
      thumbnail: '/assets/uploads/slide-2.jpg',
      duration: '12:00',
      uploaderId: currentUser?.id || currentPharmacy?.id || 'usr',
      uploaderName: currentUser?.name || currentPharmacy?.name || 'Member',
      membersOnly: isActiveDopaMember ? membersOnly : false,
    });
    setTitle('');
    setDescription('');
    setUrl('');
    setMembersOnly(false);
    setModalOpen(false);
  };

  if (videoIdParam) {
    const vid = approvedVideos.find((v) => v.id === videoIdParam);
    if (!vid) {
      return (
        <div className="py-12">
          <div className="wrap">
            <EmptyState
              icon={<VideoIcon className="w-6 h-6" />}
              title="Video not found"
              action={
                <Link to="/videos/" className="dopa-btn primary">
                  Back to videos
                </Link>
              }
            />
          </div>
        </div>
      );
    }

    const locked = vid.membersOnly && !isActiveDopaMember;
    const embed = getYoutubeEmbedUrl(vid.url);
    const related = approvedVideos.filter((v) => v.id !== vid.id);

    return (
      <div>
        <PageHeader
          crumbs={[
            { label: 'Home', to: '/' },
            { label: 'Videos', to: '/videos/' },
            { label: vid.title },
          ]}
          eyebrow={`Uploaded by ${vid.uploaderName}`}
          title={vid.title}
          actions={
            <Link to="/videos/" className="dopa-btn sm ghost">
              <ArrowLeft className="w-4 h-4" /> All videos
            </Link>
          }
        />

        <section className="pb-12">
          <div className="wrap grid lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-8 flex flex-col gap-4">
              {locked ? (
                <div className="dopa-card text-center py-12 px-6 flex flex-col items-center gap-3">
                  <Lock className="w-8 h-8 text-[var(--accent)]" />
                  <h2>DOPA Members Only Video</h2>
                  <p className="text-sm text-[var(--muted)] max-w-md">
                    Activate your free DOPA Association membership to watch exclusive briefing videos.
                  </p>
                  <Link to="/dopa-association/" className="dopa-btn primary">
                    Join DOPA Association
                  </Link>
                </div>
              ) : (
                <div className="dopa-card p-2 overflow-hidden">
                  {embed ? (
                    <div className="aspect-video w-full rounded-xl overflow-hidden bg-black">
                      <iframe
                        src={embed}
                        title={vid.title}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  ) : (
                    <video
                      src={vid.url}
                      controls
                      poster={vid.thumbnail}
                      className="w-full aspect-video rounded-xl bg-black"
                    />
                  )}
                </div>
              )}

              <div className="dopa-card flat">
                <div className="text-xs text-[var(--muted)] mb-1">
                  {formatDateShort(vid.createdAt)} · Duration {vid.duration}
                </div>
                <p className="text-[var(--muted)] leading-relaxed">{vid.description}</p>
              </div>
            </div>

            <aside className="lg:col-span-4 flex flex-col gap-3">
              <h3>Related videos</h3>
              {related.map((rv) => (
                <Link
                  key={rv.id}
                  to={`/videos/${rv.id}`}
                  className="dopa-card flat p-3 flex gap-3 no-underline text-[var(--fg)] hover:border-[var(--accent)]"
                >
                  <img
                    src={rv.thumbnail}
                    alt={rv.title}
                    className="w-24 h-16 rounded-lg object-cover shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="font-semibold text-sm line-clamp-2">{rv.title}</div>
                    <div className="text-xs text-[var(--muted)] mt-1">{rv.duration}</div>
                  </div>
                </Link>
              ))}
            </aside>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Videos' }]}
        eyebrow="Media Library"
        title="Pharmacy videos"
        intro="Educational lectures, career talks, DRAP licensing briefings, and clinical demonstrations."
        actions={
          <button type="button" onClick={() => setModalOpen(true)} className="dopa-btn primary">
            <Plus className="w-4 h-4" /> Share a video
          </button>
        }
      />

      <section className="pb-12">
        <div className="wrap grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {approvedVideos.map((vid) => (
            <article key={vid.id} className="dopa-card p-0 overflow-hidden flex flex-col">
              <Link to={`/videos/${vid.id}`} className="relative block aspect-video bg-black">
                <img
                  src={vid.thumbnail}
                  alt={vid.title}
                  className="w-full h-full object-cover opacity-90"
                />
                <span className="absolute inset-0 grid place-items-center">
                  <span className="w-12 h-12 rounded-full bg-[var(--accent)] text-white grid place-items-center shadow-lg">
                    {vid.membersOnly && !isActiveDopaMember ? (
                      <Lock className="w-5 h-5" />
                    ) : (
                      <Play className="w-5 h-5 ml-0.5" />
                    )}
                  </span>
                </span>
                <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/75 text-white text-xs font-mono-dopa">
                  {vid.duration}
                </span>
              </Link>
              <div className="p-4 flex flex-col gap-2 flex-1 justify-between">
                <div>
                  {vid.membersOnly && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--warn)] mb-1">
                      <Lock className="w-3 h-3" /> DOPA Members Only
                    </span>
                  )}
                  <h3 className="text-base font-bold">
                    <Link
                      to={`/videos/${vid.id}`}
                      className="text-[var(--fg)] hover:text-[var(--accent)] no-underline"
                    >
                      {vid.title}
                    </Link>
                  </h3>
                  <p className="text-xs text-[var(--muted)] mt-1 line-clamp-2">{vid.description}</p>
                </div>
                <div className="text-xs text-[var(--muted)] pt-2 border-t border-[var(--line)]">
                  {vid.uploaderName} · {formatDateShort(vid.createdAt)}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Share a video">
        <form onSubmit={handleShareVideo} className="flex flex-col gap-3.5">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold">Video title *</label>
            <input
              type="text"
              className="dopa-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold">YouTube URL *</label>
            <input
              type="url"
              className="dopa-input"
              placeholder="https://www.youtube.com/watch?v=..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold">Description</label>
            <textarea
              rows={3}
              className="dopa-input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          {isActiveDopaMember && (
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={membersOnly}
                onChange={(e) => setMembersOnly(e.target.checked)}
              />
              <span>Restrict to DOPA members only</span>
            </label>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="dopa-btn sm ghost">
              Cancel
            </button>
            <button type="submit" className="dopa-btn sm primary">
              Submit for review
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
