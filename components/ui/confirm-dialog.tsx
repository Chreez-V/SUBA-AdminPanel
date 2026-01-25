"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Trash2, Power } from "lucide-react";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  type?: "delete" | "deactivate" | "warning";
  isLoading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  type = "warning",
  isLoading = false,
}: ConfirmDialogProps) {
  const config = {
    delete: {
      icon: Trash2,
      color: "text-white",
      bgColor: "bg-gradient-to-br from-red-600 to-red-700",
      iconBgColor: "bg-white/20",
      borderColor: "border-red-400/30",
      buttonColor: "bg-white text-red-700 hover:bg-red-50 focus:ring-white",
      confirmText: "Eliminar",
    },
    deactivate: {
      icon: Power,
      color: "text-white",
      bgColor: "bg-gradient-to-br from-[#00457C] to-[#003459]",
      iconBgColor: "bg-[#FDB714]",
      borderColor: "border-[#0066B3]/30",
      buttonColor: "bg-[#FDB714] text-[#00457C] hover:bg-yellow-400 focus:ring-[#FDB714]",
      confirmText: "Desactivar",
    },
    warning: {
      icon: AlertTriangle,
      color: "text-white",
      bgColor: "bg-gradient-to-br from-yellow-600 to-orange-600",
      iconBgColor: "bg-white/20",
      borderColor: "border-yellow-400/30",
      buttonColor: "bg-white text-orange-700 hover:bg-yellow-50 focus:ring-white",
      confirmText: "Confirmar",
    },
  };

  const { icon: Icon, color, bgColor, iconBgColor, borderColor, buttonColor, confirmText } = config[type];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`sm:max-w-md animate-in fade-in-0 zoom-in-95 duration-200 shadow-2xl border-2 ${borderColor} ${bgColor} text-white`}>
        <DialogHeader>
          <div className="flex items-center gap-4 mb-4">
            <div className={`flex h-16 w-16 items-center justify-center rounded-xl ${iconBgColor} shadow-lg`}>
              <Icon className={`h-8 w-8 ${color}`} />
            </div>
            <DialogTitle className="text-2xl md:text-3xl font-bold text-white drop-shadow-sm">{title}</DialogTitle>
          </div>
          <DialogDescription className="text-base md:text-lg text-white/90 pt-2 leading-relaxed font-medium">
            {description}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col-reverse sm:flex-row gap-3 pt-6">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 border-2 border-white/30 bg-white/10 hover:bg-white/20 text-white font-semibold cursor-pointer transition-all duration-200 backdrop-blur-sm"
          >
            Cancelar
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 font-bold ${buttonColor} shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-base`}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Procesando...
              </>
            ) : (
              confirmText
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
