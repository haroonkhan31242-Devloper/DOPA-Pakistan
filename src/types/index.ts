export type Qualification =
  | 'Pharm.D'
  | 'B.Pharm'
  | 'M.Pharm / MPhil / PhD'
  | 'Pharmacy student'
  | 'Other pharmacy professional';

export type UserRole = 'user' | 'admin';

export type AccountStatus = 'Pending' | 'Approved' | 'Rejected' | 'Expired' | 'Revoked';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string; // Demo simulation only
  phone?: string;
  city: string;
  qualification: Qualification;
  role: UserRole;
  blocked?: boolean;
  avatar?: string;
  createdAt: string;
}

export interface DopaMembership {
  id: string;
  userId: string;
  memberNo: string; // e.g. DOPA-00001
  fullName: string;
  email: string;
  cnic: string; // 00000-0000000-0
  phone: string;
  gender: 'Male' | 'Female';
  qualification: Qualification;
  councilRegNo?: string;
  university: string;
  gradYear: string;
  workplace?: string;
  city: string;
  proofFileName?: string;
  proofFileData?: string;
  status: AccountStatus;
  rejectionReason?: string;
  submittedAt: string;
  approvedAt?: string;
  expiresAt?: string;
}

export interface BankDetails {
  accountTitle: string;
  bankName: string;
  branchCity?: string;
  iban: string;
  accountNumber: string;
}

export interface Pharmacy {
  id: string;
  ownerName: string;
  email: string;
  password: string;
  phone: string;
  name: string;
  slug: string;
  licenceNo: string;
  address: string;
  city: string;
  area?: string;
  mapsUrl?: string;
  licenceFileName?: string;
  licenceFileData?: string;
  logo?: string;
  status: AccountStatus;
  paidRef?: string;
  receiptFileName?: string;
  receiptFileData?: string;
  bankDetails: BankDetails;
  submittedAt: string;
  approvedAt?: string;
  expiresAt?: string;
}

export interface Product {
  id: string;
  slug: string;
  pharmacyId: string;
  category: string;
  name: string;
  description: string;
  image?: string;
  price: number;
  stock: number;
  active: boolean;
  createdAt: string;
}

export interface CartItem {
  productId: string;
  pharmacyId: string;
  quantity: number;
}

export type OrderStatus =
  | 'Waiting for payment confirmation'
  | 'Payment confirmed'
  | 'Dispatched'
  | 'Delivered'
  | 'Cancelled';

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  buyerId: string;
  buyerName: string;
  buyerPhone: string;
  buyerCity: string;
  deliveryAddress: string;
  notes?: string;
  pharmacyId: string;
  pharmacyName: string;
  items: OrderItem[];
  total: number;
  paymentRef: string;
  receiptFileName?: string;
  receiptFileData?: string;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

export interface MedicineRequestReply {
  id: string;
  pharmacyId: string;
  pharmacyName: string;
  pharmacyCity: string;
  pharmacyPhone: string;
  available: boolean;
  price?: number;
  note: string;
  repliedAt: string;
}

export interface MedicineRequest {
  id: string;
  userId: string;
  userName: string;
  medicineName: string;
  strengthForm: string;
  quantity: string;
  city: string;
  phone: string;
  notes?: string;
  prescriptionFileName: string;
  prescriptionFileData?: string;
  status: 'Open' | 'Closed';
  replies: MedicineRequestReply[];
  createdAt: string;
}

export type RmCategory =
  | 'API (active pharmaceutical ingredient)'
  | 'Excipient'
  | 'Solvent'
  | 'Intermediate'
  | 'Herbal extract'
  | 'Vitamin / mineral premix'
  | 'Colour / flavour'
  | 'Capsule shells'
  | 'Packaging material'
  | 'Lab chemical / reagent'
  | 'Other';

export type RmGrade =
  | 'BP'
  | 'USP'
  | 'EP'
  | 'JP'
  | 'IP'
  | 'Pharma grade (in-house)'
  | 'Food grade'
  | 'Technical grade'
  | 'Not specified';

export interface RmSeller {
  id: string;
  userId: string;
  businessName: string;
  contactPerson: string;
  phone: string;
  city: string;
  address: string;
  ntnOrLicence?: string;
  bankDetails: BankDetails;
  documentFileName?: string;
  documentFileData?: string;
  status: AccountStatus;
  submittedAt: string;
}

export interface RawMaterial {
  id: string;
  slug: string;
  sellerId: string;
  name: string;
  category: RmCategory;
  grade: RmGrade;
  casNo: string;
  description: string;
  unit: 'kg' | 'L' | 'pcs';
  pricePerUnit: number;
  minOrder: number;
  stock: number;
  city: string;
  image?: string;
  active: boolean;
  createdAt: string;
}

export interface RmOrder {
  id: string;
  orderNumber: string;
  buyerId: string;
  buyerName: string;
  buyerPhone: string;
  buyerCity: string;
  deliveryAddress: string;
  notes?: string;
  sellerId: string;
  sellerName: string;
  materialId: string;
  materialName: string;
  unit: string;
  quantity: number;
  pricePerUnit: number;
  total: number;
  paymentRef: string;
  receiptFileName?: string;
  receiptFileData?: string;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

export type JobType = 'Full-time' | 'Part-time' | 'Contract' | 'Internship' | 'Remote';

export interface Job {
  id: string;
  slug: string;
  posterId: string;
  title: string;
  organisation: string;
  location: string;
  type: JobType;
  salary?: string;
  description: string;
  requirements: string;
  deadline: string; // YYYY-MM-DD
  applyMethod: 'email' | 'phone' | 'url';
  applyValue: string;
  status: 'Pending' | 'Live' | 'Expired' | 'Rejected';
  postedAt: string;
}

export interface LifePartnerProfile {
  id: string;
  userId: string;
  name: string;
  gender: 'Male' | 'Female';
  dob: string;
  age: number;
  height: string;
  maritalStatus: 'Never married' | 'Divorced' | 'Widowed';
  city: string;
  qualification: Qualification;
  profession: string;
  workplace: string;
  familyDetails: string;
  religionSect?: string;
  about: string;
  expectations: string;
  photo?: string;
  blurPhotoToNonMembers: boolean;
  createdBy: 'Self' | 'Parent' | 'Sibling';
  phone: string;
  email: string;
  status: AccountStatus;
  paymentStatus: 'Unpaid' | 'Pending' | 'Approved' | 'Expired';
  paymentRef?: string;
  receiptFileName?: string;
  receiptFileData?: string;
  expiresAt?: string;
  createdAt: string;
}

export interface LifePartnerRequest {
  id: string;
  fromUserId: string;
  fromProfileId: string;
  toUserId: string;
  toProfileId: string;
  message?: string;
  status: 'Pending' | 'Accepted' | 'Declined';
  createdAt: string;
}

export type PostType = 'Post' | 'Question' | 'Article' | 'Video link';

export interface CommunityComment {
  id: string;
  authorId: string;
  authorName: string;
  authorRoleLabel: string;
  body: string;
  createdAt: string;
}

export interface CommunityPost {
  id: string;
  authorId: string;
  authorName: string;
  authorRoleLabel: string;
  type: PostType;
  title?: string;
  body: string;
  image?: string;
  videoUrl?: string;
  membersOnly: boolean;
  pinned?: boolean;
  status: 'Approved' | 'Pending';
  likes: string[]; // userIds
  comments: CommunityComment[];
  createdAt: string;
}

export interface VideoItem {
  id: string;
  title: string;
  description: string;
  sourceType: 'youtube' | 'upload';
  url: string;
  thumbnail: string;
  duration: string;
  uploaderId: string;
  uploaderName: string;
  membersOnly: boolean;
  status: 'Approved' | 'Pending';
  createdAt: string;
}

export interface Article {
  id: string;
  slug: string;
  category: 'Articles' | 'News';
  title: string;
  excerpt: string;
  content: string[]; // paragraphs/headings
  author: string;
  coverImage: string;
  publishedAt: string;
  membersOnly: boolean;
}

export interface University {
  id: string;
  name: string;
  city: string;
  sector: 'Public' | 'Private';
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface NewsSlide {
  id: string;
  tag?: string;
  title: string;
  description: string;
  image: string;
  link: string;
  ctaLabel: string;
}

export interface ContactMessage {
  id: string;
  target: 'Doctor of Pharmacy (Pharm.D)' | 'DOPA Association';
  name: string;
  email: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  userId: string; // 'ALL' or specific userId
  title: string;
  body: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

export interface SiteSettings {
  dopaFee: number; // 0 = Free for now
  pharmacyFee: number; // 2000
  lifePartnerFee: number; // 1000
  pharmacyBank: BankDetails;
  lifePartnerBank: BankDetails;
  dopaBank: BankDetails;
  pharmdPhone: string;
  dopaEmail: string;
  dopaPhones: string[];
  dopaOffice: string;
  facebookPage: string;
  facebookGroup: string;
  facebookProfile: string;
  instagramUrl: string;
  instagramHandle: string;
  productCategories: string[];
}

export interface AuthSession {
  kind: 'user' | 'pharmacy';
  id: string;
}
