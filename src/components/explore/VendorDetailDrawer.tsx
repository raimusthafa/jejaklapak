"use client";

import { Merchant } from "@/types/merchant";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import { VendorDetailContent } from "./VendorDetailContent";

interface VendorDetailDrawerProps {
  merchant: Merchant | null;
  isOpen: boolean;
  onClose: () => void;
  onCallVendor: (merchant: Merchant) => void;
  followCamera: boolean;
  onToggleFollowCamera: () => void;
}

export function VendorDetailDrawer({
  merchant,
  isOpen,
  onClose,
  onCallVendor,
  followCamera,
  onToggleFollowCamera,
}: VendorDetailDrawerProps) {
  if (!merchant) return null;

  return (
    <Drawer
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DrawerContent className="max-h-[85vh] h-auto p-0 overflow-hidden flex flex-col bg-white">
        <DrawerHeader className="sr-only">
          <DrawerTitle>{merchant.name}</DrawerTitle>
          <DrawerDescription>{merchant.tagline || merchant.description}</DrawerDescription>
        </DrawerHeader>
        <div className="flex-1 overflow-hidden">
          <VendorDetailContent
            merchant={merchant}
            onClose={onClose}
            onCallVendor={onCallVendor}
            followCamera={followCamera}
            onToggleFollowCamera={onToggleFollowCamera}
          />
        </div>
      </DrawerContent>
    </Drawer>
  );
}
