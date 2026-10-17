import { beforeEach, describe, expect, it } from "vitest";

import { useToastStore } from "@/store/toastStore";

describe("toastStore", () => {
  beforeEach(() => {
    useToastStore.getState().clear();
  });

  it("berisi toast kosong di awal", () => {
    expect(useToastStore.getState().toasts).toEqual([]);
  });

  it("menambahkan toast dan mengembalikan id unik", () => {
    const id = useToastStore.getState().add("success", "Tersimpan");
    const state = useToastStore.getState();
    expect(state.toasts).toHaveLength(1);
    expect(state.toasts[0].id).toBe(id);
    expect(state.toasts[0]).toMatchObject({ tone: "success", title: "Tersimpan" });
    expect(state.toasts[0].description).toBeUndefined();
  });

  it("menyimpan description bila diberikan", () => {
    useToastStore.getState().add("info", "Info", "Detail tambahan");
    expect(useToastStore.getState().toasts[0].description).toBe("Detail tambahan");
  });

  it("mengeluarkan id unik untuk setiap toast", () => {
    const a = useToastStore.getState().add("info", "A");
    const b = useToastStore.getState().add("info", "B");
    expect(a).not.toBe(b);
    expect(useToastStore.getState().toasts).toHaveLength(2);
  });

  it("menghapus toast berdasarkan id", () => {
    const a = useToastStore.getState().add("info", "A");
    useToastStore.getState().add("info", "B");
    useToastStore.getState().dismiss(a);
    const state = useToastStore.getState();
    expect(state.toasts).toHaveLength(1);
    expect(state.toasts[0].title).toBe("B");
  });

  it("mengabaikan dismiss untuk id yang tidak ada", () => {
    useToastStore.getState().add("info", "A");
    useToastStore.getState().dismiss("tidak-ada");
    expect(useToastStore.getState().toasts).toHaveLength(1);
  });

  it("clear mengosongkan semua toast", () => {
    useToastStore.getState().add("info", "A");
    useToastStore.getState().add("info", "B");
    useToastStore.getState().clear();
    expect(useToastStore.getState().toasts).toEqual([]);
  });
});
