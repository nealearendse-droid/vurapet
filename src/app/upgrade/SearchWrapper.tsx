const res = await fetch("/api/payfast/initiate", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    userId: user.id,
    plan,
    billing,
    email: user.email,
    name: profile?.full_name || "VuraPet User",
  }),
});

const responseData = await res.json();

if (!res.ok) {
  setError(responseData.error || "Payment failed");
  setLoading(false);
  return;
}

const payfastUrl = responseData.payfastUrl;
const payfastData = responseData.data;

const form = document.createElement("form");
form.method = "POST";
form.action = payfastUrl;
Object.entries(payfastData).forEach(([key, value]) => {
  const input = document.createElement("input");
  input.type = "hidden";
  input.name = key;
  input.value = value as string;
  form.appendChild(input);
});
document.body.appendChild(form);
form.submit();