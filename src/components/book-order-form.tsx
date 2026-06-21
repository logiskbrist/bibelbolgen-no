"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";

export function BookOrderForm() {
  const [delivery, setDelivery] = useState("pickup");
  const isShipping = delivery === "shipping";

  return (
    <form className="rounded-card bg-paper/72 p-6 sm:p-8">
      <p className="bb-kicker">Bestill boka</p>
      <h2 className="mt-3 text-balance font-black font-display text-3xl text-forest-900 leading-none sm:text-4xl">
        Hjelp meg å lese Bibelen
      </h2>
      <p className="bb-muted mt-4 font-medium text-base leading-7">
        Boka koster 200 kr. Vipps-betaling kobles på senere.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="book-name">Navn</Label>
          <Input id="book-name" name="name" placeholder="Navn" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="book-phone">Telefon</Label>
          <Input
            id="book-phone"
            name="phone"
            placeholder="+47 000 00 000"
            type="tel"
          />
        </div>
        <div className="grid gap-2 sm:col-span-2">
          <Label htmlFor="book-email">E-post</Label>
          <Input
            id="book-email"
            name="email"
            placeholder="navn@eksempel.no"
            type="email"
          />
        </div>
      </div>

      <div className="mt-6 grid gap-2">
        <Label htmlFor="book-delivery">Hvordan vil du få boka?</Label>
        <select
          className="min-h-11 rounded-md border border-input bg-surface/70 px-3 py-2 font-medium text-forest-950 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
          id="book-delivery"
          name="delivery"
          onChange={(event) => setDelivery(event.target.value)}
          value={delivery}
        >
          <option value="pickup">Hentes på Lags-kontoret</option>
          <option value="shipping">Sendes i posten (+ pakkeavgift)</option>
        </select>
      </div>

      {isShipping && (
        <div className="mt-5 grid gap-2">
          <Label htmlFor="book-address">Adresse ved sending</Label>
          <Textarea
            id="book-address"
            name="address"
            placeholder="Gateadresse, postnummer og sted"
            required
          />
        </div>
      )}

      <div className="mt-6 flex items-center justify-between gap-4 border-forest-900/12 border-t pt-5">
        <div>
          <p className="font-black font-display text-3xl text-forest-900">
            200 kr
          </p>
          <p className="bb-muted text-sm">Pakkeavgift kommer i tillegg.</p>
        </div>
        <Button type="button">Bestill boka</Button>
      </div>
    </form>
  );
}
