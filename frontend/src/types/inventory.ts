export type AdjustmentReason = 'DAMAGED' | 'EXPIRED' | 'LOST' | 'FOUND' | 'OTHER';

export interface StockAdjustment {
 id: string;
 adjustmentNo: string;
 productId: string;
 product: {
 id: string;
 sku: string;
 name: string;
 unit: string;
 };
 systemStock: number;
 actualStock: number;
 difference: number;
 reason: AdjustmentReason;
 notes?: string;
 createdBy: {
 id: string;
 fullName: string;
 email: string;
 };
 createdAt: string;
}

export type OpnameStatus = 'DRAFT' | 'COUNTING' | 'WAITING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'COMPLETED';

export interface StockOpnameItem {
 id: string;
 opnameId: string;
 productId: string;
 product: {
 id: string;
 sku: string;
 name: string;
 unit: string;
 rackLocation: string;
 };
 systemStock: number;
 physicalStock: number;
 difference: number;
 notes?: string;
}

export interface StockOpname {
 id: string;
 opnameNo: string;
 title: string;
 period: string;
 status: OpnameStatus;
 notes?: string;
 rejectionReason?: string;
 createdById: string;
 createdBy: {
 id: string;
 fullName: string;
 };
 verifiedById?: string;
 verifiedBy?: {
 id: string;
 fullName: string;
 };
 verifiedAt?: string;
 items?: StockOpnameItem[];
 _count?: {
 items: number;
 };
 createdAt: string;
 updatedAt: string;
}
